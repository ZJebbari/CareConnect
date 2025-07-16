using System;
using System.Collections.Generic;

namespace CareConnect.Models;

public partial class Personnel
{
    public int PersonnelId { get; set; }

    public int? UserId { get; set; }

    public virtual User? User { get; set; }
}
