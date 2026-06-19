const demoCopy = {
  ask: `bl ask "Why is this failing?"

status: read_only
changed_files: none
next: inspect evidence, then choose plan or fix`,
  plan: `bl plan "Split this safely"

status: plan_only
changed_files: none
next: review scope, verifier, and rollback before editing`,
  fix: `bl fix "Fix the failing test"

status: verified_edit_target
changed_files: scoped
next: run verifier and report not_verified if checks are skipped`,
  doctor: `babel doctor --scope all --json

status: blocked
known issue: stale godot_td repo-map path
next: repair workspace map before release-readiness claims`
};

document.addEventListener("DOMContentLoaded", () => {
  const output = document.getElementById("demo-output");
  if (!output) return;

  document.querySelectorAll("[data-command]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-command]").forEach((item) => {
        item.classList.remove("active");
      });
      button.classList.add("active");
      output.textContent = demoCopy[button.dataset.command] || demoCopy.ask;
    });
  });
});
