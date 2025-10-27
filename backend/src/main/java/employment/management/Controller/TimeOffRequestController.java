package employment.management.Controller;

import employment.management.Model.ERequestStatus;
import employment.management.Model.TimeOffRequest;
import employment.management.Service.TimeOffRequestService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/time-off")
public class TimeOffRequestController {
    @Autowired
    private TimeOffRequestService timeOffRequestService;

    @PostMapping(value = "/submit", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> submitRequest(@RequestBody TimeOffRequest request, @RequestParam UUID employeeId) {
        String result = timeOffRequestService.submitRequest(request, employeeId);
        if (result.equals("Time-off request submitted successfully")) {
            return new ResponseEntity<>(result, HttpStatus.OK);
        }
        return new ResponseEntity<>(result, HttpStatus.NOT_FOUND);
    }

    @PutMapping(value = "/update-status/{requestId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> updateRequestStatus(@PathVariable UUID requestId, @RequestParam ERequestStatus status, @RequestParam UUID adminId) {
        String result = timeOffRequestService.updateRequestStatus(requestId, status, adminId);
        if (result.equals("Request status updated successfully")) {
            return new ResponseEntity<>(result, HttpStatus.OK);
        }
        return new ResponseEntity<>(result, HttpStatus.NOT_FOUND);
    }

    @GetMapping(value = "/employee/{employeeId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<TimeOffRequest>> getRequestsByEmployee(@PathVariable UUID employeeId) {
        List<TimeOffRequest> requests = timeOffRequestService.getRequestsByEmployee(employeeId);
        return new ResponseEntity<>(requests, HttpStatus.OK);
    }

    @GetMapping(value = "/all", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<TimeOffRequest>> getAllRequests() {
        List<TimeOffRequest> requests = timeOffRequestService.getAllRequests();
        return new ResponseEntity<>(requests, HttpStatus.OK);
    }
}