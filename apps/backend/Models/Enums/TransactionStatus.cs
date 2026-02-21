// Models/Enums/TransactionStatus.cs
namespace DigitalLedger.Api.Models.Enums;

public enum TransactionStatus
{
    DRAFT,
    PENDING_APPROVAL,
    POSTED,
    VOIDED
}
