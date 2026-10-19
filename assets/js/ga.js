/* =========================================================
   HD360 Moinhos · Google Analytics 4 com Consent Mode
   Os cookies de medição só são gravados depois do "Aceitar" no
   banner (LGPD). Antes disso o GA recebe só sinais anônimos.
   Também mede os cliques em WhatsApp e telefone e os envios de formulário.
   ========================================================= */
(function () {
  var ID = "G-6B0PNDLRFN";
  var KEY = "hd360-cookies";

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;

  var aceito = false;
  try { aceito = localStorage.getItem(KEY) === "all"; } catch (e) { /* armazenamento bloqueado */ }

  gtag("consent", "default", {
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    analytics_storage: aceito ? "granted" : "denied"
  });
  gtag("js", new Date());
  gtag("config", ID);

  var s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=" + ID;
  document.head.appendChild(s);

  document.addEventListener("click", function (e) {
    if (!e.target.closest) return;
    var b = e.target.closest("[data-cookie-accept]");
    if (b && b.getAttribute("data-cookie-accept") === "all") {
      gtag("consent", "update", { analytics_storage: "granted" });
    }
    var a = e.target.closest("a[href]");
    if (!a) return;
    var href = a.getAttribute("href");
    if (/wa\.me|whatsapp\.com/.test(href)) gtag("event", "clique_whatsapp", { link_url: href });
    else if (/^tel:/.test(href)) gtag("event", "clique_telefone", { link_url: href });
  });

  // os formulários voltam para a mesma página com ?enviado=1
  if (/[?&]enviado=1/.test(location.search)) {
    gtag("event", "generate_lead", { form_page: location.pathname });
  }
})();
