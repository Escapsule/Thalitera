package com.escapsule.thalitera.json;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MeetingRoomFacilities {

    /**
     * Projector availability
     */
    private boolean projector;

    /**
     * Number of whiteboards
     */
    private int whiteboard;

    /**
     * Number of power sockets
     */
    private int powerSockets;

    /**
     * Coffee break availability
     */
    private boolean coffeeBreak;

    /**
     * Special notes
     */
    private List<String> specialNotes;

}