package com.escapsule.thalitera.json;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.util.List;

@EqualsAndHashCode(callSuper = true)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MeetingRoomFacilities extends Jsonb {

    /**
     * Projector availability
     */
    @JsonProperty("projector")
    private Boolean projector;

    /**
     * Number of whiteboards
     */
    @JsonProperty("whiteboard")
    private Integer whiteboard;

    /**
     * Number of power sockets
     */
    @JsonProperty("power_sockets")
    private Integer powerSockets;

    /**
     * Coffee break availability
     */
    @JsonProperty("coffee_break")
    private Boolean coffeeBreak;

    /**
     * Special notes
     */
    @JsonProperty("special_notes")
    private List<String> specialNotes;

}