package employment.management.Controller;

import employment.management.Service.DashboardService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {
    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/admin/summary")
    @PreAuthorize("hasAuthority('ROLE_Admin')")
    public Map<String, Object> getAdminDashboardSummary() {
        return dashboardService.getAdminDashboardSummary();
    }

    @GetMapping("/user/summary")
    @PreAuthorize("hasAuthority('ROLE_User')")
    public Map<String, Object> getUserDashboardSummary() {
        return dashboardService.getUserDashboardSummary();
    }

    @GetMapping("/admin/recent-activities")
    @PreAuthorize("hasAuthority('ROLE_Admin')")
    public Map<String, Object> getRecentActivities() {
        return dashboardService.getRecentActivities();
    }

    @GetMapping("/admin/upcoming-events")
    @PreAuthorize("hasAuthority('ROLE_Admin')")
    public Map<String, Object> getUpcomingEvents() {
        return dashboardService.getUpcomingEvents();
    }
}