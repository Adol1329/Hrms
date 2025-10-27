package employment.management.Repository;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.lang.NonNull;

import employment.management.Model.Department;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, UUID> {
    boolean existsByName(String name);

    Optional<Department> findByName(String name);

    @NonNull
    Page<Department> findAll(@NonNull Pageable pageable);

    @Query("SELECT d FROM Department d WHERE " +
           "LOWER(d.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(d.location) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<Department> searchDepartments(String searchTerm, Pageable pageable);

    @Query("SELECT d FROM Department d WHERE " +
           "LOWER(d.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(d.location) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Department> globalSearch(String query, Pageable pageable);
}