package employment.management.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.lang.NonNull;

import employment.management.Model.Employee;
import employment.management.Model.Salary;

@Repository
public interface SalaryRepository extends JpaRepository<Salary, UUID> {
    List<Salary> findByEmployee(Employee employee);

    @Query("SELECT s FROM Salary s WHERE s.baseSalary > :minSalary")
    List<Salary> findSalariesGreaterThan(BigDecimal minSalary);

    @Query("SELECT AVG(s.totalSalary) FROM Salary s JOIN s.employee e WHERE e.department.departmentId = :departmentId")
    BigDecimal findAverageSalaryByDepartment(UUID departmentId);

    @NonNull
    Page<Salary> findAll(@NonNull Pageable pageable);

    @Query("SELECT s FROM Salary s WHERE s.baseSalary >= :minSalary AND s.baseSalary <= :maxSalary")
    Page<Salary> searchSalaries(BigDecimal minSalary, BigDecimal maxSalary, Pageable pageable);
}