package employment.management.Service;

import employment.management.Model.AuditLog;
import employment.management.Repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.List;
import java.util.UUID;

@Service
public class AuditLogService {
    @Autowired
    private AuditLogRepository auditLogRepository;

    public void logAction(String action, String entityName, UUID entityId, UUID performedBy) {
        AuditLog log = new AuditLog();
        log.setAction(action);
        log.setEntityName(entityName);
        log.setEntityId(entityId);
        log.setPerformedBy(performedBy);
        log.setTimestamp(new Date());
        auditLogRepository.save(log);
    }

    public List<AuditLog> getLogsByUser(UUID userId) {
        return auditLogRepository.findByPerformedBy(userId);
    }

    public List<AuditLog> getAllLogs() {
        return auditLogRepository.findAll();
    }
}