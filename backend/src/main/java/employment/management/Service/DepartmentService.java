package employment.management.Service;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import employment.management.Model.Department;
import employment.management.Repository.DepartmentRepository;

@Service
public class DepartmentService {
    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private AuditLogService auditLogService;

    public String saveDepartment(Department department, UUID adminId) {
        if (departmentRepository.existsByName(department.getName())) {
            return "Department with name: " + department.getName() + " already exists";
        }  

        departmentRepository.save(department);
        auditLogService.logAction("CREATE", "Department", department.getDepartmentId(), adminId);
        return "Department saved successfully";
    }

    public String updateDepartment(UUID departmentId, Department departmentDetails, UUID adminId) {
        Optional<Department> department = departmentRepository.findById(departmentId); 
        if (department.isEmpty()) {
            return "Department not found";
        } 

        Department existingDepartment = department.get();

        if (departmentDetails.getName() != null) {
            if (!existingDepartment.getName().equals(departmentDetails.getName()) && 
                    departmentRepository.existsByName(departmentDetails.getName())) {
                return "Department with name: " + departmentDetails.getName() + " already exists"; 
            }
            existingDepartment.setName(departmentDetails.getName());
        }
        
        if (departmentDetails.getLocation() != null) {
            existingDepartment.setLocation(departmentDetails.getLocation());
        }
        departmentRepository.save(existingDepartment);
        auditLogService.logAction("UPDATE", "Department", departmentId, adminId);
        return "Department updated successfully";
    }

    public Page<Department> getAllDepartments(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return departmentRepository.findAll(pageable);
    }

    public Page<Department> searchDepartments(String searchTerm, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return departmentRepository.searchDepartments(searchTerm, pageable);
    }

    public Optional<Department> getDepartmentById(UUID departmentId) {
        return departmentRepository.findById(departmentId);
    }

    public Optional<Department> getDepartmentByName(String name) {
        return departmentRepository.findByName(name);
    }

    public String deleteDepartment(UUID departmentId, UUID adminId) {
        if (!departmentRepository.existsById(departmentId)) {
            return "Department not found";
        }

        departmentRepository.deleteById(departmentId);
        auditLogService.logAction("DELETE", "Department", departmentId, adminId);
        return "Department deleted successfully";
    }
}