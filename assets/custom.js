document.addEventListener('DOMContentLoaded', function () {

  // Decorative clip-path morph on featured-collection cards. Mirrored on keyboard focus,
  // skipped for prefers-reduced-motion, and null-safe for cards rendered without a clip.
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const mediaElements = document.querySelectorAll('[class*="__featured_collection"] .product-card-wrapper');
  mediaElements.forEach(function (element) {
    const clip = element.getAttribute('data-clip');
    if (!clip || reduceMotion) return;
    const forward = document.querySelector(clip + ' .animate-forward');
    const reverse = document.querySelector(clip + ' .animate-reverse');
    if (!forward || !reverse) return;
    const play = function () { forward.beginElement(); };
    const rewind = function () { reverse.beginElement(); };
    element.addEventListener('mouseenter', play);
    element.addEventListener('mouseleave', rewind);
    element.addEventListener('focusin', play);
    element.addEventListener('focusout', rewind);
  });

  // External links open in a new tab. Announce that to assistive tech via the hidden
  // #a11y-new-window-message in layout/theme.liquid (WCAG 2.4.4 / G201).
  const links = document.links;
  for (let i = 0, linksLength = links.length; i < linksLength; i++) {
    if (links[i].hostname && links[i].hostname !== window.location.hostname) {
      links[i].target = '_blank';
      links[i].rel = 'noopener';
      const describedBy = (links[i].getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean);
      if (describedBy.indexOf('a11y-new-window-message') === -1) {
        describedBy.push('a11y-new-window-message');
        links[i].setAttribute('aria-describedby', describedBy.join(' '));
      }
    }
  }

  initNewsletterPopup();

  // Event RSVP modal (sections/events-article.liquid): if the page was reloaded with a
  // server-side validation error, re-open the modal so the error is visible and announced.
  const rsvpModal = document.getElementById('PopupModal-event-rsvp');
  if (rsvpModal && rsvpModal.querySelector('.form__message') && !rsvpModal.hasAttribute('open')) {
    rsvpModal.show(document.querySelector('modal-opener[data-modal="#PopupModal-event-rsvp"] button') || document.body);
  }

}); //DOMContentLoaded

/*
 * Newsletter popup (markup in sections/footer.liquid).
 * Accessibility notes (WCAG 2.2):
 *  - The popup is delayed rather than opened the instant the page loads, and it
 *    is skipped if the visitor has already started interacting with a control,
 *    so it never steals focus mid-task (2.4.3 Focus Order).
 *  - It is opened through Dawn's ModalDialog.show(opener) so focus moves into
 *    the dialog, is trapped there, Escape closes it, and focus is returned to
 *    where it was (2.1.2 No Keyboard Trap, 2.4.11 Focus Not Obscured).
 *  - If the page was reloaded by a popup form submission (success or error
 *    message rendered inside the dialog), the dialog is re-opened so the status
 *    message is visible and announced (3.3.1 Error Identification, 4.1.3).
 */
const NEWSLETTER_POPUP_DELAY_MS = 4000;

function initNewsletterPopup() {
  const popup = document.getElementById('PopupModal-newsletter');
  if (!popup) return;

  const hasFormMessage = popup.querySelector('.form__message');
  if (hasFormMessage) {
    showPopup(popup);
    return;
  }

  if (!shouldShowPopup()) return;

  setTimeout(function () {
    const active = document.activeElement;
    const userIsBusy = active && active !== document.body && active.tagName !== 'HTML';
    if (userIsBusy || popup.hasAttribute('open')) return;
    showPopup(popup);
    try {
      localStorage.setItem('popupLastShownDate', new Date().toISOString());
    } catch (e) {
      /* storage unavailable (private mode) — popup simply shows again next visit */
    }
  }, NEWSLETTER_POPUP_DELAY_MS);
}

function shouldShowPopup() {
  let lastShownDate = null;
  try {
    lastShownDate = localStorage.getItem('popupLastShownDate');
  } catch (e) {
    return true;
  }
  if (!lastShownDate) {
    return true;
  }

  const currentDate = new Date();
  const lastShown = new Date(lastShownDate);
  const oneYear = 1000 * 60 * 60 * 24 * 365; // milliseconds in one year

  return currentDate - lastShown > oneYear;
}

function showPopup(popup) {
  popup = popup || document.getElementById('PopupModal-newsletter');
  if (!popup) return;
  // Pass an opener so ModalDialog.hide() can restore focus (removeTrapFocus(openedBy)).
  const returnFocusTo =
    document.activeElement && document.activeElement !== document.body
      ? document.activeElement
      : document.querySelector('.skip-to-content-link') || document.body;
  popup.show(returnFocusTo);
}


/* Footer "Site Credits" disclosure — a real button so it is keyboard/AT operable (WCAG 2.1.1, 4.1.2) */
document.querySelectorAll('.credits__toggle').forEach(function (toggle) {
  toggle.addEventListener('click', function () {
    var detail = document.getElementById(toggle.getAttribute('aria-controls'));
    if (!detail) return;
    toggle.setAttribute('aria-expanded', 'true');
    detail.hidden = false;
    toggle.hidden = true;
    var firstLink = detail.querySelector('a');
    if (firstLink) firstLink.focus();
  });
});

/* Header search: the summary (search icon) is display:none while the search is open, so
   Dawn's details-modal close() cannot return focus to it. Re-focus it once it is visible again
   (WCAG 2.4.3 Focus Order). */
document.querySelectorAll('.header__search details').forEach(function (details) {
  details.addEventListener('toggle', function () {
    if (details.open) return;
    var summary = details.querySelector('summary');
    if (summary && document.activeElement === document.body) {
      requestAnimationFrame(function () {
        summary.focus();
      });
    }
  });
});

/* hide contact form fields after submit */
document.addEventListener("DOMContentLoaded", function() {
    // Only collapse the form after a successful post. The error heading also carries
    // .form-status, and hiding the fields then would leave the user unable to correct it.
    var contactSuccess = document.querySelector('.form-status:not([role="alert"])');
    if (contactSuccess && contactSuccess.textContent.trim() !== '') {
        var contactText = document.querySelector('.custom_form_fields');
        if (contactText) {
            contactText.style.display = 'none';
        }

        var formElements = document.querySelectorAll('[id^="ContactForm"] input, [id^="ContactForm"] textarea, [id^="ContactForm"] button');
        formElements.forEach(function(element) {
            element.style.display = 'none';
        });
    }
});