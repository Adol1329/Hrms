package employment.management.Model;

import java.util.Date;
import java.util.UUID;

import jakarta.persistence.*;

@Entity
@Table(name = "contract")
public class Contract {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID contract_id;

    @ManyToOne
    @JoinColumn(name = "employee_id")
    private Employee employee;

    @Enumerated(EnumType.STRING)
    @Column(name = "contract_type")
    private EContractType contractType;
     
    @Column(name = "contract_start_date")
    @Temporal(TemporalType.DATE)
    private Date contractStartDate;

    @Column(name = "contract_end_date")
    @Temporal(TemporalType.DATE)
    private Date contractEndDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private EContractStatus status;

    public UUID getContractId() {
        return contract_id;
    }

    public void setContractId(UUID contractId) {
        this.contract_id = contractId;
    }

    public Employee getEmployee() {
        return employee;
    }

    public void setEmployee(Employee employee) {
        this.employee = employee;
    }

    public EContractType getContractType() {
        return contractType;
    }

    public void setContractType(EContractType contractType) {
        this.contractType = contractType;
    }
    
    public Date getContractStartDate() {
        return contractStartDate;
    }

    public void setContractStartDate(Date contractStartDate) {
        this.contractStartDate = contractStartDate;
    }

    public Date getContractEndDate() {
        return contractEndDate;
    }

    public void setContractEndDate(Date contractEndDate) {
        this.contractEndDate = contractEndDate;
    }

    public EContractStatus getStatus() {
        return status;  
    }

    public void setStatus(EContractStatus status) {
        this.status = status;
    }

}
