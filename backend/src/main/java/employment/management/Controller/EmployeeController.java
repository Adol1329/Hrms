package employment.management.Controller;
  
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import employment.management.Model.Employee;
import employment.management.Service.EmployeeService;

@RestController
@RequestMapping("/api/employee")
public class EmployeeController {
    
    @Autowired
    private EmployeeService employeeService;

    @PostMapping(value = "/save", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> saveEmployee(@RequestBody Employee employee, 
            @RequestParam UUID departmentId, 
            @RequestParam UUID positionId,
            @RequestParam UUID adminId)  {
        String result = employeeService.saveEmployee(employee, departmentId, positionId, adminId);
        if (result.equals("Employee saved successfully")) {
            return new ResponseEntity<>(result, HttpStatus.OK);
        } else if (result.equals("Department not found") || result.equals("Position not found")) {
            return new ResponseEntity<>(result, HttpStatus.NOT_FOUND);
        } else {
            return new ResponseEntity<>(result, HttpStatus.CONFLICT);
        }
    } 

    @PostMapping(value = "/bulk-save", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> bulkSaveEmployees(@RequestBody List<Employee> employees, 
            @RequestParam UUID departmentId, 
            @RequestParam UUID positionId,
            @RequestParam UUID adminId)  {
        String result = employeeService.bulkSaveEmployees(employees, departmentId, positionId, adminId);
        if (result.equals("Bulk employees saved successfully")) {
            return new ResponseEntity<>(result, HttpStatus.OK);
        }
        return new ResponseEntity<>(result, HttpStatus.BAD_REQUEST);
    }
    
    @PutMapping(value = "/update/{employeeId}", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> updateEmployee(@PathVariable UUID employeeId, 
            @RequestBody Employee employeeDetails,
            @RequestParam UUID adminId) {
        String result = employeeService.updateEmployee(employeeId, employeeDetails, adminId);
        if (result.equals("Employee updated successfully")) {
            return new ResponseEntity<>(result, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(result, HttpStatus.NOT_FOUND);
        }
    }
   
    @PutMapping(value = "/transfer/{employeeId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> transferEmployee(@PathVariable UUID employeeId, 
            @RequestParam UUID departmentId, 
            @RequestParam UUID positionId,
            @RequestParam UUID adminId) {
        String result = employeeService.transferEmployee(employeeId, departmentId, positionId, adminId);
        if (result.equals("Employee transferred successfully")) {
            return new ResponseEntity<>(result, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(result, HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping(value = "/all", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Page<Employee>> getAllEmployees(
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "10") int size) {
        Page<Employee> employees = employeeService.getAllEmployees(page, size);
        return new ResponseEntity<>(employees, HttpStatus.OK);
    }

    @GetMapping(value = "/search", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Page<Employee>> searchEmployees(@RequestParam String query, @RequestParam int page, @RequestParam int size) {
        Page<Employee> employees = employeeService.searchEmployees(query, page, size);
        return new ResponseEntity<>(employees, HttpStatus.OK);
    }

    @GetMapping(value = "/{employeeId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getEmployeeById(@PathVariable UUID employeeId) {
        Optional<Employee> employee = employeeService.getEmployeeById(employeeId);
        if (employee.isPresent()) {
            return new ResponseEntity<>(employee.get(), HttpStatus.OK); 
        } else {
            return new ResponseEntity<>("Employee not found", HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping(value = "/department/{departmentId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<Employee>> getEmployeesByDepartment(@PathVariable UUID departmentId) {
        List<Employee> employees = employeeService.getEmployeesByDepartment(departmentId);
        return new ResponseEntity<>(employees, HttpStatus.OK);
    }

    @GetMapping(value = "/position/{positionId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<Employee>> getEmployeesByPosition(@PathVariable UUID positionId) {
        List<Employee> employees = employeeService.getEmployeesByPosition(positionId);
        return new ResponseEntity<>(employees, HttpStatus.OK);
    }

    @DeleteMapping(value = "/delete/{employeeId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> deleteEmployee(@PathVariable UUID employeeId, @RequestParam UUID adminId) {
        String result = employeeService.deleteEmployee(employeeId, adminId);
        if (result.equals("Employee deleted successfully")) {
            return new ResponseEntity<>(result, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(result, HttpStatus.NOT_FOUND);
        }
    }
}