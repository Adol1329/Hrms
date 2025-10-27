package employment.management.Controller;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import employment.management.Model.Contract;
import employment.management.Model.EContractStatus;
import employment.management.Model.EContractType;
import employment.management.Model.User;
import employment.management.Service.ContractService;
import employment.management.Service.UserService;

@RestController
@RequestMapping("/api/contract")
public class ContractController {
    
    @Autowired
    private ContractService contractService;

    @Autowired
    private UserService userService;

    @PostMapping(value = "/save", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> saveContract(@RequestBody Contract contract, 
                                         @RequestParam UUID employeeId,
                                         @RequestParam(required = false) UUID adminId,
                                         @RequestParam(required = false) String adminEmail) {
        // If adminEmail is provided, get the admin's ID
        UUID effectiveAdminId = adminId;
        if (adminId == null && adminEmail != null) {
            Optional<User> admin = userService.getUserByEmail(adminEmail);
            if (admin.isEmpty()) {
                return new ResponseEntity<>("Admin not found", HttpStatus.NOT_FOUND);
            }
            effectiveAdminId = admin.get().getUserId();
        }

        if (effectiveAdminId == null) {
            return new ResponseEntity<>("Either adminId or adminEmail must be provided", HttpStatus.BAD_REQUEST);
        }

        String result = contractService.saveContract(contract, employeeId, effectiveAdminId);
        if (result.equals("Contract saved successfully")) {
            return new ResponseEntity<>(result, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(result, HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping(value = "/update-status/{contractId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> updateContractStatus(@PathVariable UUID contractId, 
                                                 @RequestParam EContractStatus status,
                                                 @RequestParam UUID adminId) {
        String result = contractService.updateContractStatus(contractId, status, adminId);
        if (result.equals("Contract status updated successfully")) {
            return new ResponseEntity<>(result, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(result, HttpStatus.NOT_FOUND);
        }
    }

    @PutMapping(value = "/extend/{contractId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> extendContract(@PathVariable UUID contractId, 
                                           @RequestParam @DateTimeFormat(pattern = "yyyy-MM-dd") Date newEndDate,
                                           @RequestParam UUID adminId) {
        String result = contractService.extendContract(contractId, newEndDate, adminId);
        if (result.equals("Contract extended successfully")) {
            return new ResponseEntity<>(result, HttpStatus.OK);
        } else if (result.equals("Contract not found")) {
            return new ResponseEntity<>(result, HttpStatus.NOT_FOUND);
        } else {
            return new ResponseEntity<>(result, HttpStatus.BAD_REQUEST);
        }
    }

    @GetMapping(value = "/all", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Page<Contract>> getAllContracts(@RequestParam int page, @RequestParam int size) {
        Page<Contract> contracts = contractService.getAllContracts(page, size);
        return new ResponseEntity<>(contracts, HttpStatus.OK);
    }

    @GetMapping(value = "/search", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Page<Contract>> searchContracts(@RequestParam(required = false) EContractType type,
                                                         @RequestParam(required = false) EContractStatus status,
                                                         @RequestParam int page, @RequestParam int size) {
        Page<Contract> contracts = contractService.searchContracts(type, status, page, size);
        return new ResponseEntity<>(contracts, HttpStatus.OK);
    }
      
    @GetMapping(value = "/{contractId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getContractById(@PathVariable UUID contractId) {
        Optional<Contract> contract = contractService.getContractById(contractId);
        if (contract.isPresent()) {
            return new ResponseEntity<>(contract.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Contract not found", HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping(value = "/employee/{employeeId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<Contract>> getContractsByEmployee(@PathVariable UUID employeeId) {
        List<Contract> contracts = contractService.getContractsByEmployee(employeeId);
        return new ResponseEntity<>(contracts, HttpStatus.OK);
    }

    @GetMapping(value = "/type/{type}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<Contract>> getContractsByType(@PathVariable EContractType type) {
        List<Contract> contracts = contractService.getContractsByType(type);
        return new ResponseEntity<>(contracts, HttpStatus.OK);
    }

    @GetMapping(value = "/status/{status}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<Contract>> getContractsByStatus(@PathVariable EContractStatus status) {
        List<Contract> contracts = contractService.getContractsByStatus(status);  
        return new ResponseEntity<>(contracts, HttpStatus.OK);
    }

    @GetMapping(value = "/expired", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<Contract>> getExpiredContracts() {
        List<Contract> contracts = contractService.getExpiredContracts();
        return new ResponseEntity<>(contracts, HttpStatus.OK);
    }

    @DeleteMapping(value = "/delete/{contractId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> deleteContract(@PathVariable UUID contractId, @RequestParam UUID adminId) {
        String result = contractService.deleteContract(contractId, adminId);
        if (result.equals("Contract deleted successfully")) {
            return new ResponseEntity<>(result, HttpStatus.OK);
        } else {
            return new ResponseEntity<>(result, HttpStatus.NOT_FOUND);
        }
    }
}