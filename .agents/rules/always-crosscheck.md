# Mandatory Agent Rule: Always Crosscheck Before Delivery

Whenever paired with the user in this project:

1. **Mandatory Crosscheck Protocol**:
   Before delivering any answer, solution, or code change to the user, the agent MUST execute the 6-Gate verification checklist from the `always-crosscheck` skill.

2. **Zero Assumptions**:
   - Never say code or UI is ready without verifying it with an actual build command (e.g. `npm run build`, `expo export -p web`, or test runner).
   - Re-read user prompts carefully to guarantee all positive and negative constraints (e.g., "hapus X", "tidak perlu Y", "satu kalimat saja", "jangan sama persis") are strictly adhered to.

3. **Verification Summary**:
   Conclude every deliverable response with a clear verification stamp confirming:
   - What was tested and verified
   - Build status (exit code 0)
   - Git commit & push status
