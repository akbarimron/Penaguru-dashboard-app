---
name: always-crosscheck
description: Mandatory pre-delivery crosscheck and quality assurance protocol for AI coding agents. Enforces strict verification of user requirements, visual UI fidelity, cross-platform layouts, build & test execution, anti-regression, and git hygiene before sending any response to the user. Use whenever completing a task, modifying UI, fixing bugs, or preparing a delivery to the user.
---

# Always Crosscheck Skill (Mandatory Pre-Delivery Protocol)

> **Core Rule**: *"Biasakan crosscheck dulu sebelum dikirim ke user."*  
> Never declare a task complete, deliver changes, or ask the user to review before completing the **6-Gate Pre-Delivery Verification Checklist**.

---

## The 6-Gate Pre-Delivery Checklist

Before formulating the final response to the user, the agent MUST run through and satisfy all 6 gates:

### Gate 1: Exact Requirement Tracing
- [ ] **Clause-by-Clause Audit**: Re-read the user prompt from top to bottom. Identify every single numbered item, bullet point, and conversational instruction.
- [ ] **Verification Against Code**: Trace each requirement directly to the modified file and line numbers.
- [ ] **Negative Constraints**: Did the user say *"hapus ini"*, *"tidak perlu background"*, *"jangan sama persis"*, *"satu kalimat saja"*? Verify that forbidden elements are 100% removed, not merely hidden.
- [ ] **Scope Completeness**: Ensure zero requirements are left half-done, deferred, or forgotten.

---

### Gate 2: Visual & UI/UX Fidelity
- [ ] **Screenshot Comparison**: Compare the rendered layout against all images and screenshots uploaded by the user.
- [ ] **Responsive Dual-Target Check**:
  - **Mobile (<900px)**: Check safe areas, touch targets (min 44px), card overlaps, banners, and bottom sheets.
  - **Desktop (>=900px)**: Check split-screen full-width alignment, padding, column balance, and whitespace filling.
- [ ] **Color & Contrast Harmony**:
  - Text on dark/blue backgrounds must have high contrast (white `#FFFFFF`, light pastel accents, no dark-on-dark text).
  - Background gradients must flow smoothly without harsh cutoff lines, dark seams, or mismatched canvas borders.
- [ ] **Motion & Animation Craft (/motion-design)**:
  - Non-human / graphic characters must NOT use stiff linear movement.
  - Apply **Volume-Preserving Squash and Stretch** on landings and jumps.
  - Apply **Secondary Motion & Overlapping Action** (accessories like pins, ribbons, or tails lag naturally behind main bodies).
  - Apply natural **Blink Cycles** and sinusoidal breathing/hover curves.

---

### Gate 3: Build & Execution Verification
- [ ] **Never Assume — Always Execute**:
  - Run the relevant build / export / test command (e.g. `npm run build`, `expo export -p web`, `npm test`, or `tsc --noEmit`).
- [ ] **Inspect Output Logs**: Confirm exit code is `0` and verify there are zero fatal exceptions, bundle warnings, missing assets, or syntax errors.

---

### Gate 4: Asset & Dependency Reality Check
- [ ] **Asset Existence**: Check that all referenced assets (`require(...)`, `import ...`) actually exist on disk in both source directories and bundle output.
- [ ] **Transparency & Boundaries**: Image assets must have strict 0-alpha backgrounds without white borders, dark halo artifacts, or pixelation.
- [ ] **Cross-Platform Compatibility**: Ensure components work seamlessly across Web (browser) and Native (iOS / Android) without crashing on platform-specific APIs.

---

### Gate 5: Code Cleanliness & Anti-Regression
- [ ] **No Dead Code**: Remove unused imports, abandoned test variables, console logs, and commented-out scrap code.
- [ ] **Documentation Integrity**: Maintain existing project architecture, conventions, and unrelated comments.
- [ ] **Regression Check**: Ensure existing working features (e.g. login authentication, form validation, navigation links) remain completely functional.

---

### Gate 6: Version Control (Git) Hygiene
- [ ] **Git Diff Inspection**: Run `git diff` and `git status` to inspect all touched files before staging. Verify no accidental modifications or temporary scratch files remain unstaged.
- [ ] **Atomic, Clear Commit**: Commit with semantic prefixes (`feat:`, `style:`, `fix:`, `refactor:`, `copy:`).
- [ ] **Remote Synchronization**: Push commits to the remote branch (`git push origin <branch>`) and verify successful exit code `0`.

---

## Response Verification Stamp

When concluding your response to the user, always provide a concise summary of the crosscheck results:
1. **Requirements Addressed**: Brief confirmation of each requested change.
2. **Verification Passed**: Build command run, exit code, and bundle confirmation.
3. **Git Status**: Commit hash and branch pushed.
