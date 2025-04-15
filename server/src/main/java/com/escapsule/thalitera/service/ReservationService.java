package com.escapsule.thalitera.service;

import com.escapsule.thalitera.vo.ReservationVO;

import java.util.List;

public interface ReservationService {

    /**
     * Fetch all reservations
     *
     * @return List of all reservations
     */
    List<ReservationVO> getAllReservations();
}
