package employment.management.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import employment.management.Model.Department;
import employment.management.Model.EPositionLevel;
import employment.management.Model.Position;
import employment.management.Repository.DepartmentRepository;
import employment.management.Repository.PositionRepository;

@Service 
public class PositionService {
    @Autowired
    private PositionRepository positionRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private AuditLogService auditLogService;

    public String savePosition(Position position, UUID departmentId, UUID adminId) {
        Optional<Department> department = departmentRepository.findById(departmentId);
        if (department.isEmpty()) {
            return "Department not found";
        } 
        
        if (positionRepository.existsByTitleAndDepartment(position.getTitle(), department.get())) {
            return "Position with title: " + position.getTitle() + " already exists in the department";
        }

        position.setDepartment(department.get());
        positionRepository.save(position);
        auditLogService.logAction("CREATE", "Position", position.getPositionId(), adminId);
        return "Position saved successfully";
    }

    public String updatePosition(UUID positionId, Position positionDetails, UUID adminId) {
        Optional<Position> position = positionRepository.findById(positionId);
        if (position.isEmpty()) {
            return "Position not found";
        }
        Position existingPosition = position.get();

        if (positionDetails.getTitle() != null) {
            if (!existingPosition.getTitle().equals(positionDetails.getTitle()) && 
                    positionRepository.existsByTitleAndDepartment(positionDetails.getTitle(), existingPosition.getDepartment())) {
                return "Position with title: " + positionDetails.getTitle() + " already exists in the department";     
            } 
            existingPosition.setTitle(positionDetails.getTitle());
        }

        if (positionDetails.getDescription() != null) {
            existingPosition.setDescription(positionDetails.getDescription());  
        }

        if (positionDetails.getLevel() != null) {
            existingPosition.setLevel(positionDetails.getLevel());
        }

        positionRepository.save(existingPosition);
        auditLogService.logAction("UPDATE", "Position", positionId, adminId);
        return "Position updated successfully";
    }

    public Page<Position> getAllPositions(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return positionRepository.findAll(pageable);
    }

    public Page<Position> searchPositions(String searchTerm, EPositionLevel level, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return positionRepository.searchPositions(searchTerm, level, pageable);
    }

    public Optional<Position> getPositionById(UUID positionId) {
        return positionRepository.findById(positionId);
    }

    public List<Position> getPositionsByDepartment(UUID departmentId) {
        Optional<Department> department = departmentRepository.findById(departmentId);
        if (department.isEmpty()) {
            return List.of();
        }

        return positionRepository.findByDepartment(department.get());
    }

    public List<Position> getPositionsByLevel(EPositionLevel level) {
        return positionRepository.findByLevel(level);
    }

    public String deletePosition(UUID positionId, UUID adminId) {
        if (!positionRepository.existsById(positionId)) {
            return "Position not found";
        }

        positionRepository.deleteById(positionId);
        auditLogService.logAction("DELETE", "Position", positionId, adminId);
        return "Position deleted successfully";
    }
}