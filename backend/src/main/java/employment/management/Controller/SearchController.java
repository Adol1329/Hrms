package employment.management.Controller;

import employment.management.Service.SearchService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/search")
@CrossOrigin(origins = "*")
public class SearchController {
    private final SearchService searchService;

    public SearchController(SearchService searchService) {
        this.searchService = searchService;
    }

    @GetMapping("/global")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> globalSearch(
            @RequestParam String query,
            Pageable pageable) {
        return ResponseEntity.ok(searchService.globalSearch(query, pageable));
    }

    @GetMapping("/employees")
    @PreAuthorize("hasAuthority('ROLE_Admin')")
    public ResponseEntity<Page<?>> searchEmployees(
            @RequestParam String query,
            Pageable pageable) {
        return ResponseEntity.ok(searchService.searchEmployees(query, pageable));
    }

    @GetMapping("/departments")
    @PreAuthorize("hasAuthority('ROLE_Admin')")
    public ResponseEntity<Page<?>> searchDepartments(
            @RequestParam String query,
            Pageable pageable) {
        return ResponseEntity.ok(searchService.searchDepartments(query, pageable));
    }

    @GetMapping("/contracts")
    @PreAuthorize("hasAuthority('ROLE_Admin')")
    public ResponseEntity<Page<?>> searchContracts(
            @RequestParam String query,
            Pageable pageable) {
        return ResponseEntity.ok(searchService.searchContracts(query, pageable));
    }

    @GetMapping("/positions")
    @PreAuthorize("hasAuthority('ROLE_Admin')")
    public ResponseEntity<Page<?>> searchPositions(
            @RequestParam String query,
            Pageable pageable) {
        return ResponseEntity.ok(searchService.searchPositions(query, pageable));
    }
}