package employment.management.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import employment.management.Model.Document;
import employment.management.Model.Employee;
import java.util.UUID;
import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, UUID> {
    List<Document> findByEmployee(Employee employee);
}