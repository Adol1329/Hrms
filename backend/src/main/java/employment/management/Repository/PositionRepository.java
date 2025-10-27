package employment.management.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.lang.NonNull;

import employment.management.Model.Department;
import employment.management.Model.EPositionLevel;
import employment.management.Model.Position;

@Repository
public interface PositionRepository extends JpaRepository<Position, UUID> {
    boolean existsByTitleAndDepartment(String title, Department department);

    Optional<Position> findByTitleAndDepartment(String title, Department department);

    List<Position> findByDepartment(Department department);

    List<Position> findByLevel(EPositionLevel level);

    @NonNull
    Page<Position> findAll(@NonNull Pageable pageable);

    @Query("SELECT p FROM Position p WHERE " +
           "LOWER(p.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "p.level = :level")
    Page<Position> searchPositions(String searchTerm, EPositionLevel level, Pageable pageable);

    @Query("SELECT p FROM Position p WHERE " +
           "LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.level) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Position> globalSearch(String query, Pageable pageable);
}
