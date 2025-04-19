package com.escapsule.thalitera.service.impl;

import com.escapsule.thalitera.constant.ReservationStatusConstant;
import com.escapsule.thalitera.constant.UserStatusConstant;
import com.escapsule.thalitera.dto.ReservationDTO;
import com.escapsule.thalitera.dto.TimeRangeDTO;
import com.escapsule.thalitera.entity.MeetingRoom;
import com.escapsule.thalitera.entity.Reservation;
import com.escapsule.thalitera.entity.User;
import com.escapsule.thalitera.enumeration.ErrorCode;
import com.escapsule.thalitera.enumeration.NotifyType;
import com.escapsule.thalitera.event.ReservationInitAndCancelNotifyEvent;
import com.escapsule.thalitera.event.ReservationUpdateNotifyEvent;
import com.escapsule.thalitera.exception.BaseException;
import com.escapsule.thalitera.mapper.MeetingRoomMapper;
import com.escapsule.thalitera.mapper.ReservationMapper;
import com.escapsule.thalitera.mapper.UserMapper;
import com.escapsule.thalitera.po.MeetingRoomPO;
import com.escapsule.thalitera.service.ReservationService;
import com.escapsule.thalitera.transfer.MeetingRoomTransfer;
import com.escapsule.thalitera.transfer.ReservationTransfer;
import com.escapsule.thalitera.utils.TokenUtils;
import com.escapsule.thalitera.vo.ReservationVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReservationServiceImpl implements ReservationService {

    private final ReservationMapper reservationMapper;
    private final MeetingRoomMapper meetingRoomMapper;
    private final UserMapper userMapper;
    private final ApplicationEventPublisher eventPublisher;

    private final Set<Long> validTimeInterval = Set.of(
            30L, 60L, 90L, 120L
    );

//    private final OffsetDateTime undefinedTime = OffsetDateTime.parse("1970-01-01T00:00:00Z");

    /**
     * Get all active meeting rooms.
     *
     * @return The list of all active meeting rooms.
     */
    @Override
    public List<MeetingRoom> getAllActiveMeetingRooms() {
        return meetingRoomMapper.getActiveMeetingRoomsByFilter(
                MeetingRoomPO.builder()
                        .build()
        );
    }

    @Override
    public List<MeetingRoom> getMeetingRoom(ReservationDTO reservationDTO) {
        // Check if the start time is after the end time
        if (reservationDTO.getStartTime() != null && reservationDTO.getEndTime() != null) {
            if (reservationDTO.getStartTime().isAfter(reservationDTO.getEndTime())
                    || reservationDTO.getStartTime().isEqual(reservationDTO.getEndTime())) {
                throw new BaseException(ErrorCode.INVALID_TIME_RANGE);
            }
        }
        // Construct the query object
        MeetingRoomPO meetingRoomPO = new MeetingRoomPO();
        if (reservationDTO.getAttendeesCount() != null) {
            meetingRoomPO.setAttendeesCount(reservationDTO.getAttendeesCount());
        }
        if (StringUtils.isNotBlank(reservationDTO.getBuilding())) {
            meetingRoomPO.setBuilding(reservationDTO.getBuilding());
        }
        if (reservationDTO.getFloor() != null) {
            meetingRoomPO.setFloor(reservationDTO.getFloor());
        }
        if (reservationDTO.getFacilities() != null) {
            meetingRoomPO.setFacilities(
                    MeetingRoomTransfer.INSTANCE.mapMapToFacilities(
                            reservationDTO.getFacilities()
                    )
            );
        }
        log.info("Get active meeting rooms by filter: {}", meetingRoomPO);
        // Get the list of meeting rooms
        List<MeetingRoom> suitableMeetingRooms = meetingRoomMapper.getActiveMeetingRoomsByFilter(meetingRoomPO);
        Set<UUID> conflictRoomIds = new HashSet<>();
        // Check conflicts
        for (MeetingRoom meetingRoom : suitableMeetingRooms) {
            List<Reservation> reservations = reservationMapper.getConfirmedReservationsByRoomId(
                    meetingRoom.getRoomId()
            );
            for (Reservation r : reservations) {
                if (
                        checkConflict(
                                reservationDTO.getStartTime(), reservationDTO.getEndTime(),
                                r.getStartTime(),          r.getEndTime()
                        )
                ) {
                    conflictRoomIds.add(meetingRoom.getRoomId());
                }
            }
        }
        // Remove the conflicting meeting rooms
        suitableMeetingRooms.removeIf(meetingRoom -> conflictRoomIds.contains(meetingRoom.getRoomId()));
        return suitableMeetingRooms;
    }

    /**
     * Book a meeting room.
     *
     * @param reservationDTO The DTO object containing the parameters for the meeting room.
     * @return True if the booking is successful, throw an exception otherwise.
     */
    @Override
    @Transactional
    public boolean makeReservation(ReservationDTO reservationDTO,
                                   UUID userId) {
        // Time Interval Validation
        timeValidation(reservationDTO.getStartTime(), reservationDTO.getEndTime());
        LocalDate day = reservationDTO.getStartTime().toLocalDate();
        // Generate a reservation ID
        UUID reservationId = UUID.randomUUID();
        // Construct the reservation object
        Reservation reservation = ReservationTransfer.INSTANCE.newReservationDTO2Reservation(
                reservationDTO, reservationId, TokenUtils.generateShortToken(), userId
        );
        // Distinct the attendees
        List<String> emails = reservationDTO.getAttendees().stream().distinct()
                .filter(email -> StringUtils.isNotBlank(email) && StringUtils.isNotEmpty(email))
                .toList();
        if (emails.isEmpty()) {
            throw new BaseException(ErrorCode.MISSING_ATTENDEES);
        }
        // Verify the capacity strict
        capacityVerification(reservationDTO, emails.size() + 1);
        // Batch query to get users by emails
        List<User> users = userMapper.getUsersByEmails(emails);
        // Map the users by email
        Map<String, User> emailUserMap = users.stream()
                .collect(Collectors.toMap(User::getEmail, Function.identity()));
        // Check if all emails are valid
        emails.forEach(email -> {
            User user = emailUserMap.get(email);
            if (user == null) {
                throw new BaseException(ErrorCode.USER_NOT_FOUND.getCode(), email + " not found");
            }
            if (userId.equals(user.getUserId())) {
                throw new BaseException(ErrorCode.PERMISSION_DENIED.getCode(), "Cannot add yourself as attendee.");
            }
            if (!UserStatusConstant.ACTIVE.equals(user.getStatus())) {
                throw new BaseException(ErrorCode.USER_NOT_ACTIVE.getCode(), email + " is not active.");
            }
            reservation.getAttendees().add(user.getUserId());
        });
        reservationMapper.makeReservation(reservation);
        // Get the list of confirmed reservations
        List<Reservation> reservations = reservationMapper.getConfirmedReservationsByRoomId(
                reservationDTO.getRoomId()
        );
        // Check conflicts
        for (Reservation r : reservations) {
            if (r.getUserId().equals(userId) && day.equals(r.getStartTime().toLocalDate())) {
                reservationMapper.deleteReservation(reservationId);
                throw new BaseException(
                        ErrorCode.PERMISSION_DENIED.getCode(), "One can only make one reservation per day"
                );
            }
            if (
                    checkConflict(
                            reservationDTO.getStartTime(), reservationDTO.getEndTime(),
                            r.getStartTime(),              r.getEndTime()
                    )
                    && r.getStatus().equals(ReservationStatusConstant.CONFIRMED)
            ) {
                reservationMapper.deleteReservation(reservationId);
                throw new BaseException(ErrorCode.CONFLICT_RESERVATION);
            }
        }
        // Update the reservation status
        reservationMapper.updateReservationStatus(reservationId, ReservationStatusConstant.CONFIRMED);
        initAndCancelNotify(users, reservation, userId, NotifyType.RESERVATION_INIT_EMAIL);
        return true;
    }

    /**
     * Update a reservation.
     *
     * @param reservationDTO The DTO object containing the parameters for the reservation.
     * @param userId Operator
     * @return True if the update is successful, throw an exception otherwise.
     */
    @Override
    @Transactional
    public boolean updateReservation(ReservationDTO reservationDTO, UUID userId) {
        // Time Interval Validation
        timeValidation(reservationDTO.getStartTime(), reservationDTO.getEndTime());
        LocalDate day = reservationDTO.getStartTime().toLocalDate();
        // Get the old reservation
        Reservation oldReservation = reservationMapper.getReservationByReservationId(
                reservationDTO.getReservationId()
        );
        if (oldReservation == null) {
            throw new BaseException(ErrorCode.RESERVATION_NOT_FOUND);
        }
        if (!oldReservation.getUserId().equals(userId)) {
            throw new BaseException(
                    ErrorCode.PERMISSION_DENIED.getCode(), "Cannot edit reservation created by other."
            );
        }
        // Get the list of confirmed reservations
        List<Reservation> reservations = reservationMapper.getConfirmedReservationsByRoomId(
                reservationDTO.getRoomId()
        );
        for (Reservation r : reservations) {
            // Skip the current reservation
            if (r.getReservationId().equals(reservationDTO.getReservationId())) {
                continue;
            }
            if (r.getUserId().equals(userId) && day.equals(r.getStartTime().toLocalDate())) {
                throw new BaseException(
                        ErrorCode.PERMISSION_DENIED.getCode(), "One can only make one reservation per day"
                );
            }
            // Check conflicts
            if (
                    checkConflict(
                            reservationDTO.getStartTime(), reservationDTO.getEndTime(),
                            r.getStartTime(),              r.getEndTime()
                    )
                    && r.getStatus().equals(ReservationStatusConstant.CONFIRMED)
            ) {
                throw new BaseException(ErrorCode.CONFLICT_RESERVATION);
            }
        }
        // Update the reservation
        Reservation newReservation = ReservationTransfer.INSTANCE.updateReservationDTO2Reservation(
                reservationDTO, oldReservation.getVersion(), oldReservation.getQrToken(), oldReservation.getUserId()
        );
        // Distinct the attendees
        List<String> emails = reservationDTO.getAttendees().stream().distinct()
                .filter(email -> StringUtils.isNotBlank(email) && StringUtils.isNotEmpty(email))
                .toList();
        if (emails.isEmpty()) {
            throw new BaseException(ErrorCode.MISSING_ATTENDEES);
        }
        // If attendees count and room id are not changed, skip the check
        if (!(
                oldReservation.getRoomId().equals(reservationDTO.getRoomId()) &&
                oldReservation.getAttendees().size() == emails.size()
        )) {
            // Verify the capacity strict
            capacityVerification(reservationDTO, emails.size() + 1);
        }
        // Batch query to get users by emails
        List<User> users = userMapper.getUsersByEmails(emails);
        // Map the users by email
        Map<String, User> emailUserMap = users.stream()
                .collect(Collectors.toMap(User::getEmail, Function.identity()));
        // Check if all emails are valid
        emails.forEach(email -> {
            User user = emailUserMap.get(email);
            if (user == null) {
                throw new BaseException(ErrorCode.USER_NOT_FOUND.getCode(), email + " not found");
            }
            if (userId.equals(user.getUserId())) {
                throw new BaseException(ErrorCode.PERMISSION_DENIED.getCode(), "Cannot add yourself as attendee.");
            }
            if (!UserStatusConstant.ACTIVE.equals(user.getStatus())) {
                throw new BaseException(ErrorCode.USER_NOT_ACTIVE.getCode(), email + " is not active.");
            }
            newReservation.getAttendees().add(user.getUserId());
        });
        reservationMapper.updateReservation(newReservation);
        updateNotify(oldReservation, newReservation, userId);
        return true;
    }

    /**
     * Cancel a meeting room reservation.
     *
     * @param reservationId The ID of the reservation to cancel.
     * @param userId Operator
     * @return True if the cancellation is successful, throw an exception otherwise.
     */
    @Override
    @Transactional
    public boolean cancelReservation(UUID reservationId, UUID userId) {
        // Check if the reservation ID is provided
        if (reservationId == null) {
            throw new BaseException(ErrorCode.MISSING_RESERVATION_ID);
        }
        // Get the reservation
        Reservation reservation = reservationMapper.getReservationByReservationId(reservationId);
        // Check if the reservation exists
        if (reservation == null) {
            throw new BaseException(ErrorCode.RESERVATION_NOT_FOUND);
        }
        if (!reservation.getUserId().equals(userId)) {
            throw new BaseException(
                    ErrorCode.PERMISSION_DENIED.getCode(), "Cannot cancel reservation created by other."
            );
        }
        // Update the reservation status
        reservationMapper.updateReservationStatus(reservationId, ReservationStatusConstant.CANCELED);
        initAndCancelNotify(
                userMapper.getUsersByIds(reservation.getAttendees()),
                reservation,
                userId,
                NotifyType.RESERVATION_CANCEL_EMAIL
        );
        return true;
    }

    /**
     * Fetch all reservations
     *
     * @return List of all reservations
     */
    @Override
    public List<ReservationVO> getAllReservations() {
        List<ReservationVO> vo = reservationMapper.getAllReservationDetails();
        for (ReservationVO v : vo) {
            v.setRoomId(UUID.fromString(v.getMeetingRoom().getRoomId()));
        }
        return vo;
    }

    /**
     * Fetch all reservations related to a specific user
     *
     * @param userId target user ID
     * @return List of all reservations
     */
    @Override
    public List<ReservationVO> getMyReservations(UUID userId) {
        List<ReservationVO> vo = reservationMapper.getUserRelatedReservationDetailsByUserId(userId);
        for (ReservationVO v : vo) {
            v.setRoomId(UUID.fromString(v.getMeetingRoom().getRoomId()));
        }
        return vo;
    }

    /**
     * Fetch all reservations related to a specific meeting room
     *
     * @param roomId target meeting room ID
     * @param dateTime target date
     * @return List of all reserved time ranges
     */
    @Override
    public List<TimeRangeDTO> getMeetingRoomReservedTime(UUID roomId, OffsetDateTime dateTime) {
        // specify the date
        OffsetDateTime startOfDay = dateTime.withHour(0).withMinute(0).withSecond(0).withNano(0);
        OffsetDateTime endOfDay = dateTime.withHour(23).withMinute(59).withSecond(59).withNano(999999999);
        List<Reservation> reservations = reservationMapper.getConfirmedReservationsByRoomId(roomId);
        if (reservations == null || reservations.isEmpty()) {
            return List.of();
        }
        List<TimeRangeDTO> timeRanges = new ArrayList<>();
        for (Reservation r : reservations) {
            // Check if the reservation is within the specified date
            if (
                    (r.getStartTime().isAfter(startOfDay) || r.getStartTime().isEqual(startOfDay)) &&
                    (r.getEndTime().isBefore(endOfDay) || r.getEndTime().isEqual(endOfDay))
            ) {
                timeRanges.add(
                        TimeRangeDTO.builder()
                                .startTime(r.getStartTime())
                                .endTime(r.getEndTime())
                                .build()
                );
            }
        }
        // Sort the time ranges by start time
        timeRanges.sort(Comparator.comparing(TimeRangeDTO::getStartTime));
        return timeRanges;
    }

    /**
     * Check if the reservation time conflicts with the existing reservations
     * @param startTime requested start time
     * @param endTime requested end time
     * @param reservationStartTime existing reservation start time
     * @param reservationEndTime existing reservation end time
     * @return <code>true</code> if there is a conflict, <code>false</code> otherwise
     */
    private boolean checkConflict(OffsetDateTime startTime, OffsetDateTime endTime,
                                  OffsetDateTime reservationStartTime, OffsetDateTime reservationEndTime) {
        // 1. st <= rs < et
        // 2. st < re <= et
        // 3. rs <= st < et <= re
        return
                //case 1
                (
                        // st <= rs
                        (
                                startTime.isBefore(reservationStartTime) ||
                                startTime.isEqual(reservationStartTime)
                        ) &&
                        // rs < et
                        endTime.isAfter(reservationStartTime)
                ) ||
                //case 2
                (
                        // st < re
                        startTime.isBefore(reservationEndTime) &&
                        // re <= et
                        (
                                endTime.isEqual(reservationEndTime) ||
                                endTime.isAfter(reservationEndTime)
                        )
                ) ||
                //case 3
                (
                        // rs <= st
                        (
                                reservationStartTime.isBefore(startTime) ||
                                reservationStartTime.isEqual(startTime)
                        ) &&
                        // st < et
                        (
                                reservationEndTime.isEqual(endTime) ||
                                reservationEndTime.isAfter(endTime)
                        )
                )
        ;
    }

    /**
     * Verify if the capacity of the room is valid for required attendees count
     *
     * @param reservationDTO The DTO object containing the parameters for the meeting room.
     * @param attendeesCount The number of attendees
     */
    private void capacityVerification(ReservationDTO reservationDTO, int attendeesCount) {
        MeetingRoom room = meetingRoomMapper.getMeetingRoomByRoomId(reservationDTO.getRoomId());
        if (room == null) {
            throw new BaseException(ErrorCode.MEETING_ROOM_NOT_FOUND);
        }
        if (attendeesCount > room.getCapacityMax() || attendeesCount < room.getCapacityMin()) {
            throw new BaseException(ErrorCode.INVALID_ATTENDEES_COUNT);
        }
    }

    /**
     * Validate the time range
     *
     * @param st requested start time
     * @param ed requested end time
     */
    private void timeValidation(OffsetDateTime st, OffsetDateTime ed) {
        if (
                st == null || ed == null ||
                st.isAfter(ed) || st.isEqual(ed) ||
                st.isBefore(OffsetDateTime.now()) || ed.isBefore(OffsetDateTime.now()) ||
                (st.getMinute() != 0 && st.getMinute() != 30) ||
                (ed.getMinute() != 0 && ed.getMinute() != 30) ||
                (!(st.toLocalDate().equals(ed.toLocalDate())))
        ) {
            throw new BaseException(ErrorCode.INVALID_TIME_RANGE);
        }
        long timeInterval = ed.toEpochSecond() - st.toEpochSecond();
        if (!validTimeInterval.contains(timeInterval / 60)) {
            throw new BaseException(ErrorCode.INVALID_TIME_INTERVAL);
        }
    }

    private void initAndCancelNotify(List<User> users, Reservation reservation, UUID userId, NotifyType notifyType) {
        // notify the attendees
        List<String> userNames = users.stream()
                .map(User::getUsername)
                .toList();
        MeetingRoom meetingRoom = meetingRoomMapper.getMeetingRoomByRoomId(reservation.getRoomId());
        List<UUID> userIds = new ArrayList<>(reservation.getAttendees());
        userIds.add(userId);
        eventPublisher.publishEvent(
                new ReservationInitAndCancelNotifyEvent(
                        this,
                        meetingRoom.getName(),
                        reservation.getStartTime().toLocalDateTime(),
                        reservation.getEndTime().toLocalDateTime(),
                        meetingRoom.getBuilding(),
                        meetingRoom.getFloor(),
                        userMapper.getUserById(userId).getUsername(),
                        userNames,
                        userIds,
                        notifyType
                )
        );
    }


    private void updateNotify(Reservation oldReservation, Reservation newReservation, UUID userId) {
        List<UUID> oldAttendees = oldReservation.getAttendees();
        List<UUID> newAttendees = newReservation.getAttendees();
        Set<UUID> addedAttendees = new HashSet<>(newAttendees);
        addedAttendees.addAll(oldAttendees);
        addedAttendees.add(userId);
        List<UUID> targetUser = new ArrayList<>(addedAttendees);
        List<User> users = userMapper.getUsersByIds(targetUser);
        Map<UUID, User> uuid2User = users.stream()
                .collect(Collectors.toMap(User::getUserId, Function.identity()));
        List<String> oldUserNames = oldAttendees.stream()
                .map(uuid2User::get)
                .map(User::getUsername)
                .toList();
        List<String> newUserNames = newAttendees.stream()
                .map(uuid2User::get)
                .map(User::getUsername)
                .toList();
        MeetingRoom oldMeetingRoom = meetingRoomMapper.getMeetingRoomByRoomId(
                oldReservation.getRoomId()
        );
        MeetingRoom newMeetingRoom = meetingRoomMapper.getMeetingRoomByRoomId(
                newReservation.getRoomId()
        );
        eventPublisher.publishEvent(
                new ReservationUpdateNotifyEvent(
                        this,
                        oldMeetingRoom.getName(),
                        newMeetingRoom.getName(),
                        oldMeetingRoom.getBuilding(),
                        newMeetingRoom.getBuilding(),
                        oldMeetingRoom.getFloor(),
                        newMeetingRoom.getFloor(),
                        oldReservation.getStartTime().toLocalDateTime(),
                        newReservation.getStartTime().toLocalDateTime(),
                        oldReservation.getEndTime().toLocalDateTime(),
                        newReservation.getEndTime().toLocalDateTime(),
                        oldUserNames,
                        newUserNames,
                        oldReservation.getPurpose(),
                        newReservation.getPurpose(),
                        userMapper.getUserById(userId).getUsername(),
                        targetUser
                )
        );
    }
}
