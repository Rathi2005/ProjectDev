import Swal from "sweetalert2";

export const showUserDetailsModal = (user) => {
  Swal.fire({
    title: "User Details",
    html: `
      <div style="text-align:left;font-size:14px;line-height:1.6">

        <h3 style="color:#a5b4fc;margin-bottom:6px">👤 User Info</h3>
        <p><b>Name:</b> ${user.firstName} ${user.lastName}</p>
        <p><b>Email:</b> ${user.email}</p>
        <p><b>User ID:</b> ${user.id}</p>

        <hr style="margin:12px 0;border-color:#374151" />

        <h3 style="color:#34d399;margin-bottom:6px">🏢 Billing</h3>
        <p><b>Company:</b> ${user.billingAddress?.companyName || "N/A"}</p>
        <p><b>Phone:</b> ${user.billingAddress?.phoneNumber || "N/A"}</p>
        <p><b>Country:</b> ${user.billingAddress?.country || "N/A"}</p>

        <hr style="margin:12px 0;border-color:#374151" />

        <h3 style="color:#60a5fa;margin-bottom:6px">🖥 Virtual Machines</h3>
        ${
          user.vms?.length
            ? user.vms
                .map(
                  (vm) => `
            <div style="background:#111827;padding:8px;border-radius:6px;margin-bottom:6px">
              <b>${vm.vmName}</b><br/>
              Status: ${vm.status} • ${vm.liveState}<br/>
              CPU: ${vm.cores} | RAM: ${vm.ramMb / 1024}GB | Disk: ${vm.diskGb}GB
            </div>
          `,
                )
                .join("")
            : `<p>No VMs available</p>`
        }

      </div>
    `,
    width: "700px",
    confirmButtonText: "Close",
    background: "#1e2640",
    color: "#ffffff",
  });
};
