package com.infosys.carbonfootprint.dto;

import com.infosys.carbonfootprint.entity.UserStatus;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StatusUpdateRequest {

    private UserStatus status;

    private String remark;
}

