package employment.management.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import employment.management.Model.TimeOffRequest;
import employment.management.Model.Employee;
import java.util.UUID;
import java.util.List;

@Repository
public interface TimeOffRequestRepository extends JpaRepository<TimeOffRequest, UUID> {
    List<TimeOffRequest> findByEmployee(Employee employee);
}