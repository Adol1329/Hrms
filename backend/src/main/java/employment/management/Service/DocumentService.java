package employment.management.Service;

import employment.management.Model.Document;
import employment.management.Model.Employee;
import employment.management.Repository.DocumentRepository;
import employment.management.Repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class DocumentService {
    @Autowired
    private DocumentRepository documentRepository;

    @Autowired
    private EmployeeRepository employeeRepository;

    public String uploadDocument(Document document, UUID employeeId) {
        Optional<Employee> employee = employeeRepository.findById(employeeId);
        if (employee.isEmpty()) {
            return "Employee not found";
        }

        document.setEmployee(employee.get());
        documentRepository.save(document);
        return "Document uploaded successfully";
    }

    public List<Document> getDocumentsByEmployee(UUID employeeId) {
        Optional<Employee> employee = employeeRepository.findById(employeeId);
        if (employee.isEmpty()) {
            return List.of();
        }

        return documentRepository.findByEmployee(employee.get());
    }

    public List<Document> getAllDocuments() {
        return documentRepository.findAll();
    }
}
