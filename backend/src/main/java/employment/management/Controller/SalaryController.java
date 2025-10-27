package employment.management.Controller;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import employment.management.Model.Salary;
import employment.management.Service.SalaryService;

@RestController
@RequestMapping("/api/salary")
public class SalaryController {
    
    @Autowired
    private SalaryService salaryService;

    @PostMapping(value = "/save", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> saveSalary(@RequestBody Salary salary, 
                                       @RequestParam UUID employeeId,
                                       @RequestParam UUID adminId) {
        String result = salaryService.saveSalary(salary, employeeId, adminId);
        if (result.equals("Salary saved successfully")) {
            return new ResponseEntity<>(result, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(result, HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping(value = "/update/{salaryId}", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> updateSalary(@PathVariable UUID salaryId, 
                                         @RequestBody Salary salaryDetails,
                                         @RequestParam UUID adminId) {
        String result = salaryService.updateSalary(salaryId, salaryDetails, adminId);
        if (result.equals("Salary updated successfully")) {
            return new ResponseEntity<>(result, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(result, HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping(value = "/bulk-adjust", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> bulkAdjustSalaries(@RequestParam List<UUID> employeeIds,
                                               @RequestParam BigDecimal baseAdjustment,
                                               @RequestParam(required = false) BigDecimal bonusAdjustment,
                                               @RequestParam UUID adminId) {
        String result = salaryService.bulkAdjustSalaries(employeeIds, baseAdjustment, bonusAdjustment, adminId);
        if (result.equals("Bulk salary adjustment successful")) {
            return new ResponseEntity<>(result, HttpStatus.OK);
        }
        return new ResponseEntity<>(result, HttpStatus.BAD_REQUEST);
    }

    @GetMapping(value = "/all", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getAllSalaries(
            @RequestParam(required = false) Boolean paginated,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "10") int size) {
        if (paginated != null && paginated) {
            Page<Salary> salaries = salaryService.getAllSalaries(page, size);
            return new ResponseEntity<>(salaries, HttpStatus.OK);
        } else {
            List<Salary> salaries = salaryService.getAllSalariesNoPagination();
            return new ResponseEntity<>(salaries, HttpStatus.OK);
        }
    }

    @GetMapping(value = "/search", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Page<Salary>> searchSalaries(@RequestParam BigDecimal minSalary,
                                                      @RequestParam BigDecimal maxSalary,
                                                      @RequestParam int page, @RequestParam int size) {
        Page<Salary> salaries = salaryService.searchSalaries(minSalary, maxSalary, page, size);
        return new ResponseEntity<>(salaries, HttpStatus.OK);
    }

    @GetMapping(value = "/{salaryId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getSalaryById(@PathVariable UUID salaryId) {
        Optional<Salary> salary = salaryService.getSalaryById(salaryId);
        if (salary.isPresent()) {
            return new ResponseEntity<>(salary.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Salary record not found", HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping(value = "/employee/{employeeId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<Salary>> getSalariesByEmployee(@PathVariable UUID employeeId) {
        List<Salary> salaries = salaryService.getSalariesByEmployee(employeeId);
        return new ResponseEntity<>(salaries, HttpStatus.OK);
    }

    @GetMapping(value = "/above/{threshold}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<Salary>> getSalariesAboveThreshold(@PathVariable BigDecimal threshold) {
        List<Salary> salaries = salaryService.getSalariesAboveThreshold(threshold);
        return new ResponseEntity<>(salaries, HttpStatus.OK);
    }

    @GetMapping(value = "/average/department/{departmentId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<BigDecimal> getAverageSalaryByDepartment(@PathVariable UUID departmentId) {
        BigDecimal average = salaryService.getAverageSalaryByDepartment(departmentId);
        return new ResponseEntity<>(average, HttpStatus.OK);
    }

    @DeleteMapping(value = "/delete/{salaryId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> deleteSalary(@PathVariable UUID salaryId, @RequestParam UUID adminId) {
        String result = salaryService.deleteSalary(salaryId, adminId);
        if (result.equals("Salary record deleted successfully")) {
            return new ResponseEntity<>(result, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(result, HttpStatus.NOT_FOUND);
        }
    }
}