/* ============================================================
   GHSA — Become a Member Page JS
   ============================================================ */

const joinExecCheckbox = document.getElementById('joinExec');
const joinMemberCheckbox = document.getElementById('joinMember');
const execSection  = document.getElementById('bmExecSection');
const bmForm       = document.getElementById('bmForm');
const bmFormState  = document.getElementById('bmFormState');
const bmSuccess    = document.getElementById('bmSuccessState');
const submitBtn    = document.getElementById('bmSubmitBtn');
const submitLabel  = document.getElementById('bmSubmitLabel');

// ── EXEC SECTION TOGGLE ──────────────────────────────
// Show exec section when "Join the Exec Team" is checked
joinExecCheckbox.addEventListener('change', () => {
    if (joinExecCheckbox.checked) {
        execSection.classList.add('visible');
    } else {
        execSection.classList.remove('visible');
        // clear exec fields when hidden
        execSection.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
        document.getElementById('bmBio').value = '';
    }
});

// Visual feedback on checkbox cards
[joinMemberCheckbox, joinExecCheckbox].forEach(cb => {
    cb.addEventListener('change', () => {
        const card = cb.closest('.bm-checkbox-card');
        if (cb.checked) {
            card.classList.add('checked');
        } else {
            card.classList.remove('checked');
        }
    });
});

// ── FORM VALIDATION ──────────────────────────────────
function validateForm() {
    const firstName = document.getElementById('bmFirstName').value.trim();
    const lastName  = document.getElementById('bmLastName').value.trim();
    const email     = document.getElementById('bmEmail').value.trim();
    const school    = document.getElementById('bmSchool').value;
    const major     = document.getElementById('bmMajor').value.trim();
    const year      = document.getElementById('bmYear').value;
    const joinMember = document.getElementById('joinMember').checked;
    const joinExec   = document.getElementById('joinExec').checked;

    if (!firstName || !lastName || !email || !school || !major || !year) {
        alert('Please fill in all required fields.');
        return false;
    }

    if (!joinMember && !joinExec) {
        alert('Please select at least one option — Join as a Member or Join the Exec Team.');
        return false;
    }

    if (joinExec) {
        const selectedTeams = document.querySelectorAll('input[name="execTeam"]:checked');
        const bio = document.getElementById('bmBio').value.trim();
        if (selectedTeams.length === 0) {
            alert('Please select at least one exec team you\'re interested in.');
            return false;
        }
        if (!bio) {
            alert('Please tell us about yourself in the text box.');
            return false;
        }
    }

    return true;
}

// ── FORM SUBMIT ──────────────────────────────────────
bmForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    submitBtn.disabled = true;
    submitLabel.textContent = 'Submitting...';

    // Collect all form data
    const selectedTeams = Array.from(
        document.querySelectorAll('input[name="execTeam"]:checked')
    ).map(cb => cb.value);

    const data = {
        firstName:   document.getElementById('bmFirstName').value.trim(),
        lastName:    document.getElementById('bmLastName').value.trim(),
        email:       document.getElementById('bmEmail').value.trim(),
        school:      document.getElementById('bmSchool').value,
        major:       document.getElementById('bmMajor').value.trim(),
        year:        document.getElementById('bmYear').value,
        joinMember:  document.getElementById('joinMember').checked,
        joinExec:    document.getElementById('joinExec').checked,
        execTeams:   selectedTeams,
        bio:         document.getElementById('bmBio').value.trim(),
    };

    try {
        // Replace 'YOUR_FORM_ENDPOINT' with your actual endpoint
        // Options: Formspree (https://formspree.io), EmailJS, or your own backend
        const res = await fetch('YOUR_FORM_ENDPOINT', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (res.ok) {
            // Show success state
            bmFormState.style.display = 'none';
            bmSuccess.style.display   = 'block';
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            throw new Error('Server error');
        }

    } catch (err) {
        console.error('Submission error:', err);
        submitBtn.disabled    = false;
        submitLabel.textContent = 'Submit Application';
        alert('Something went wrong. Please email ucalgaryghsa@gmail.com directly.');
    }
});