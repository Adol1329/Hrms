package employment.management.Controller;

import employment.management.Model.AuditLog;
import employment.management.Service.AuditLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/audit")
public class AuditLogController {
    @Autowired
    private AuditLogService auditLogService;

    @GetMapping(value = "/all", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<AuditLog>> getAllLogs() {
        List<AuditLog> logs = auditLogService.getAllLogs();
        return new ResponseEntity<>(logs, HttpStatus.OK);
    }

    @GetMapping(value = "/user/{userId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<AuditLog>> getLogsByUser(@PathVariable UUID userId) {
        List<AuditLog> logs = auditLogService.getLogsByUser(userId);
        return new ResponseEntity<>(logs, HttpStatus.OK);
    }
}