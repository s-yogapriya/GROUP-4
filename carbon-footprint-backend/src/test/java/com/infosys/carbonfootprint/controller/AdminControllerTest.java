package com.infosys.carbonfootprint.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.infosys.carbonfootprint.config.SecurityConfig;
import com.infosys.carbonfootprint.dto.*;
import com.infosys.carbonfootprint.entity.Gender;
import com.infosys.carbonfootprint.entity.UserStatus;
import com.infosys.carbonfootprint.security.UserDetailsServiceImpl;
import com.infosys.carbonfootprint.security.jwt.JwtAuthEntryPoint;
import com.infosys.carbonfootprint.security.jwt.JwtUtils;
import com.infosys.carbonfootprint.service.AdminService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AdminController.class)
@Import(SecurityConfig.class)
public class AdminControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AdminService adminService;

    @MockBean
    private com.infosys.carbonfootprint.service.ActivityLogService activityLogService;

    @MockBean
    private UserDetailsServiceImpl userDetailsService;

    @MockBean
    private JwtUtils jwtUtils;

    @MockBean
    private JwtAuthEntryPoint jwtAuthEntryPoint;

    @Autowired
    private ObjectMapper objectMapper;

    private UserSummaryDto sampleSummaryDto;
    private UserDetailDto sampleDetailDto;
    private DashboardStatsDto sampleStatsDto;

    @BeforeEach
    void setUp() {
        sampleSummaryDto = UserSummaryDto.builder()
                .id(1L)
                .username("john.doe")
                .email("john@example.com")
                .firstName("John")
                .lastName("Doe")
                .mobileNumber("9876543210")
                .gender(Gender.MALE)
                .status(UserStatus.PENDING)
                .firstLogin(true)
                .build();

        sampleDetailDto = UserDetailDto.builder()
                .id(1L)
                .username("john.doe")
                .email("john@example.com")
                .firstName("John")
                .lastName("Doe")
                .status(UserStatus.APPROVED)
                .firstLogin(true)
                .build();

        sampleStatsDto = DashboardStatsDto.builder()
                .totalUsers(10L)
                .pendingUsers(5L)
                .approvedUsers(4L)
                .rejectedUsers(1L)
                .maleCount(6L)
                .femaleCount(4L)
                .otherGenderCount(0L)
                .recentRegistrations(List.of(sampleSummaryDto))
                .build();
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testGetDashboardStats_Success() throws Exception {
        when(adminService.getDashboardStats()).thenReturn(sampleStatsDto);

        mockMvc.perform(get("/api/v1/admin/dashboard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalUsers").value(10))
                .andExpect(jsonPath("$.data.pendingUsers").value(5));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testGetAllUsers_Success() throws Exception {
        when(adminService.getAllUsers()).thenReturn(List.of(sampleSummaryDto));

        mockMvc.perform(get("/api/v1/admin/users"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].email").value("john@example.com"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testGetUsersByStatus_Uppercase_Success() throws Exception {
        when(adminService.getUsersByStatus(UserStatus.PENDING)).thenReturn(List.of(sampleSummaryDto));

        mockMvc.perform(get("/api/v1/admin/users/status/PENDING"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].status").value("PENDING"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testGetUsersByStatus_Lowercase_Success() throws Exception {
        when(adminService.getUsersByStatus(UserStatus.PENDING)).thenReturn(List.of(sampleSummaryDto));

        mockMvc.perform(get("/api/v1/admin/users/status/pending"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].status").value("PENDING"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testGetUserById_Success() throws Exception {
        when(adminService.getUserById(1L)).thenReturn(sampleDetailDto);

        mockMvc.perform(get("/api/v1/admin/users/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(1));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testApproveUser_Success() throws Exception {
        when(adminService.approveUser(1L)).thenReturn(sampleDetailDto);

        mockMvc.perform(post("/api/v1/admin/users/1/approve"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("APPROVED"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testRejectUser_WithBody_Success() throws Exception {
        StatusUpdateRequest request = StatusUpdateRequest.builder()
                .status(UserStatus.REJECTED)
                .remark("Invalid Document")
                .build();

        UserDetailDto rejectedDto = UserDetailDto.builder()
                .id(1L)
                .status(UserStatus.REJECTED)
                .build();

        when(adminService.rejectUser(eq(1L), any())).thenReturn(rejectedDto);

        mockMvc.perform(post("/api/v1/admin/users/1/reject")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("REJECTED"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testRejectUser_WithoutBody_Success() throws Exception {
        UserDetailDto rejectedDto = UserDetailDto.builder()
                .id(1L)
                .status(UserStatus.REJECTED)
                .build();

        when(adminService.rejectUser(eq(1L), any())).thenReturn(rejectedDto);

        mockMvc.perform(post("/api/v1/admin/users/1/reject"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser(roles = "USER")
    void testAdminEndpoint_ForbiddenForNonAdmin() throws Exception {
        mockMvc.perform(get("/api/v1/admin/dashboard"))
                .andExpect(status().isForbidden());
    }
}
