package employment.management.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import employment.management.Model.AuditLog;
import java.util.UUID;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {
    List<AuditLog> findByPerformedBy(UUID performedBy);
    List<AuditLog> findTop10ByOrderByTimestampDesc();
}