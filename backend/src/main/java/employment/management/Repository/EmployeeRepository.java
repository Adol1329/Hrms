package employment.management.Repository;

import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.lang.NonNull;

import employment.management.Model.Department;
import employment.management.Model.Employee;
import employment.management.Model.Position;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, UUID> {
    boolean existsByEmail(String email);
    
    Optional<Employee> findByEmail(String email);
    
    List<Employee> findByDepartment(Department department);
    
    List<Employee> findByPosition(Position position);

    @NonNull
    Page<Employee> findAll(@NonNull Pageable pageable);

    @Query("SELECT e FROM Employee e WHERE " +
           "LOWER(e.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(e.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(e.email) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<Employee> searchEmployees(String searchTerm, Pageable pageable);

    Page<Employee> findAllByOrderByHireDateDesc(Pageable pageable);
    
    @Query("SELECT e.department.name as department, COUNT(e) as count FROM Employee e GROUP BY e.department.name")
    List<Map<String, Object>> countByDepartment();
    
    List<Employee> findByProbationEndDateBetween(Date startDate, Date endDate);
    
    @Query("SELECT e FROM Employee e LEFT JOIN e.department d LEFT JOIN e.position p WHERE " +
           "LOWER(e.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(e.lastName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(e.email) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(d.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           ":query = ''")
    Page<Employee> globalSearch(String query, Pageable pageable);
}