package employment.management.Controller;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import employment.management.Model.EPositionLevel;
import employment.management.Model.Position;
import employment.management.Service.PositionService;

@RestController
@RequestMapping("/api/position")
public class PositionController {
  
    @Autowired
    private PositionService positionService;
    
    @PostMapping(value = "/save", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> savePosition(@RequestBody Position position, 
                                         @RequestParam UUID departmentId,
                                         @RequestParam UUID adminId) {
        String result = positionService.savePosition(position, departmentId, adminId);
        if (result.equals("Position saved successfully")) {
            return new ResponseEntity<>(result, HttpStatus.OK);
        } else if (result.equals("Department not found")) {
            return new ResponseEntity<>(result, HttpStatus.NOT_FOUND);
        } else {
            return new ResponseEntity<>(result, HttpStatus.CONFLICT);
        }
    }

    @PutMapping(value = "/update/{positionId}", consumes = MediaType.APPLICATION_JSON_VALUE, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> updatePosition(@PathVariable UUID positionId, 
                                           @RequestBody Position positionDetails,
                                           @RequestParam UUID adminId) {
        String result = positionService.updatePosition(positionId, positionDetails, adminId);
        if (result.equals("Position updated successfully")) {
            return new ResponseEntity<>(result, HttpStatus.OK);
        } else if (result.equals("Position not found")) {
            return new ResponseEntity<>(result, HttpStatus.NOT_FOUND);
        } else {
            return new ResponseEntity<>(result, HttpStatus.CONFLICT);
        }
    }
    
    @GetMapping(value = "/all", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getAllPositions(
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "10") int size) {
        Page<Position> positions = positionService.getAllPositions(page, size);
        return new ResponseEntity<>(positions, HttpStatus.OK); 
    }

    @GetMapping(value = "/search", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Page<Position>> searchPositions(@RequestParam String query, 
                                                         @RequestParam(required = false) EPositionLevel level,
                                                         @RequestParam int page, @RequestParam int size) {
        Page<Position> positions = positionService.searchPositions(query, level, page, size);
        return new ResponseEntity<>(positions, HttpStatus.OK);
    }

    @GetMapping(value = "/{positionId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> getPositionById(@PathVariable UUID positionId) {
        Optional<Position> position = positionService.getPositionById(positionId);
        if (position.isPresent()) {
            return new ResponseEntity<>(position.get(), HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Position not found", HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping(value = "/department/{departmentId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<Position>> getPositionsByDepartment(@PathVariable UUID departmentId) {
        List<Position> positions = positionService.getPositionsByDepartment(departmentId);
        return new ResponseEntity<>(positions, HttpStatus.OK);
    }

    @GetMapping(value = "/level/{level}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<Position>> getPositionsByLevel(@PathVariable EPositionLevel level) {
        List<Position> positions = positionService.getPositionsByLevel(level);
        return new ResponseEntity<>(positions, HttpStatus.OK); 
    }

    @DeleteMapping(value = "/delete/{positionId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<?> deletePosition(@PathVariable UUID positionId, @RequestParam UUID adminId) {
        String result = positionService.deletePosition(positionId, adminId);
        if (result.equals("Position deleted successfully")) {
           return new ResponseEntity<>(result, HttpStatus.OK); 
        } else {
            return new ResponseEntity<>(result, HttpStatus.NOT_FOUND);
        }
    }

    @GetMapping("/levels")
    public ResponseEntity<List<String>> getAllPositionLevels() {
        return ResponseEntity.ok(Arrays.stream(EPositionLevel.values())
                .map(Enum::name)
                .collect(Collectors.toList()));
    }
}