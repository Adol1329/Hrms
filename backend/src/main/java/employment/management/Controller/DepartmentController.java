package employment.management.Controller;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import employment.management.Model.Department;
import employment.management.Service.DepartmentService;

@RestController
@RequestMapping("/api/department")
public class DepartmentController {
  
    @Autowired
    private DepartmentService departmentService;

    @PostMapping(value = "/save", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> saveDepartment(@RequestBody Department department, @RequestParam UUID adminId) {
        String result = departmentService.saveDepartment(department, adminId);
        if (result.equals("Department saved successfully")) {
            return new ResponseEntity<>(result, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(result, HttpStatus.CONFLICT);
        }
    }

    @PutMapping(value = "/update/{departmentId}", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> updateDepartment(@PathVariable UUID departmentId, 
                                             @RequestBody Department departmentDetails,
                                             @RequestParam UUID adminId) {
        String result = departmentService.updateDepartment(departmentId, departmentDetails, adminId);
        if (result.equals("Department updated successfully")) {
            return new ResponseEntity<>(result, HttpStatus.OK); 
        } else if (result.equals("Department not found")) {
            return new ResponseEntity<>(result, HttpStatus.NOT_FOUND);
        } else {
            return new ResponseEntity<>(result, HttpStatus.CONFLICT);
        }                                    
    }

    @GetMapping(value = "/all", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getAllDepartments(
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "10") int size) {
        Page<Department> departments = departmentService.getAllDepartments(page, size);
        return new ResponseEntity<>(departments, HttpStatus.OK);
    }

    @GetMapping(value = "/search", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Page<Department>> searchDepartments(@RequestParam String query, @RequestParam int page, @RequestParam int size) {
        Page<Department> departments = departmentService.searchDepartments(query, page, size);
        return new ResponseEntity<>(departments, HttpStatus.OK);
    }
    
    @GetMapping(value = "/{departmentId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getDepartmentById(@PathVariable UUID departmentId) {
        Optional<Department> department = departmentService.getDepartmentById(departmentId);
        if (department.isPresent()) {
            return new ResponseEntity<>(department.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Department not found", HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping(value = "/name/{name}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getDepartmentByName(@PathVariable String name) {
        Optional<Department> department = departmentService.getDepartmentByName(name);
        if (department.isPresent()) {
            return new ResponseEntity<>(department.get(), HttpStatus.OK); 
        } else {
            return new ResponseEntity<>("Department not found", HttpStatus.NOT_FOUND);
        } 
    }

    @DeleteMapping(value = "/delete/{departmentId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> deleteDepartment(@PathVariable UUID departmentId, @RequestParam UUID adminId) {
        String result = departmentService.deleteDepartment(departmentId, adminId);
        if (result.equals("Department deleted successfully")) {
            return new ResponseEntity<>(result, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(result, HttpStatus.NOT_FOUND);
        }
    }
}