package employment.management.Model;

import java.util.List;
import java.util.UUID;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;

@Entity
@Table(name = "position")
public class Position {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID position_id;

    @Column(name = "title")
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "level")
    private EPositionLevel level;

    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;

    @OneToMany(mappedBy = "position")
    @JsonIgnore
    private List<Employee> employees;
    

    public UUID getPositionId() {
        return position_id;
    }

    public void setPositionId(UUID positionId) {
        this.position_id = positionId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public EPositionLevel getLevel() {
        return level;
    }

    public void setLevel(EPositionLevel level) {
        this.level = level;
    }

     public Department getDepartment() {
        return department;
     }

     public void setDepartment(Department department) {
        this.department = department;
     }

     public List<Employee> getEmployees() {
        return employees;
     } 

     public void setEmployees(List<Employee> employees) {
        this.employees = employees;
     }
}
