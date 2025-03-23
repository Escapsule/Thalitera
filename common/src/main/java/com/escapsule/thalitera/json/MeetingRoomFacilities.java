package com.escapsule.thalitera.json;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MeetingRoomFacilities {

    /**
     * Projector availability
     */
    public boolean projector;

    /**
     * Number of whiteboards
     */
    public int whiteboard;

    /**
     * Number of power sockets
     */
    public int powerSockets;

    /**
     * Coffee break availability
     */
    public boolean coffeeBreak;

    /**
     * Special notes
     */
    public List<String> specialNotes;

}