/* Seven-day Obsidian and Space Coin promotion, activated by eligible Play offers. */
const SALE_PROMOTION_I18N = Object.freeze({
  zh: { kicker:"7 天限時特價", title:"星際補給特價", heroLabel:"最高狂省", heroSub:"黑曜石與太空幣，最高省 70%。", featured:"超值補給", more:"更多優惠", off:"折扣", bannerHeadline:"星際補給限時特價", detail:"黑曜石與太空幣，最高省 70%。", close:"關閉", view:"查看全部特價", later:"稍後再看", buy:"立即選購", discount:v=>`${10-v/10} 折`, badge:v=>`限時 ${10-v/10} 折` },
  en: { kicker:"7-DAY LIMITED SALE", title:"Cosmic Supply Sale", heroLabel:"SAVE UP TO", heroSub:"Obsidian and Space Coins at special prices.", featured:"TOP DEAL", more:"MORE SAVINGS", off:"OFF", bannerHeadline:"Cosmic Supply Sale", detail:"Save up to 70% on Obsidian and Space Coins.", close:"Close", view:"See all offers", later:"Maybe later", buy:"Shop now", discount:v=>`${v}% OFF`, badge:v=>`LIMITED -${v}%` },
  ja: { kicker:"7日間限定", title:"宇宙補給セール", heroLabel:"最大", heroSub:"黒曜石とスペースコインが特別価格。", featured:"おすすめ補給", more:"ほかにもお得", off:"オフ", bannerHeadline:"宇宙補給セール", detail:"黒曜石・スペースコインが最大70%オフ。", close:"閉じる", view:"特価商品をすべて見る", later:"あとで見る", buy:"商品を見る", discount:v=>`${v}%オフ`, badge:v=>`限定 ${v}%オフ` },
  ko: { kicker:"7일 한정 특가", title:"우주 보급 특가", heroLabel:"최대", heroSub:"흑요석과 우주 코인을 특별한 가격에.", featured:"특별 보급", more:"다른 할인 상품", off:"할인", bannerHeadline:"우주 보급 한정 할인", detail:"흑요석과 우주 코인 최대 70% 할인.", close:"닫기", view:"전체 특가 보기", later:"나중에 보기", buy:"상품 보기", discount:v=>`${v}% 할인`, badge:v=>`한정 ${v}% 할인` },
  ru: { kicker:"РАСПРОДАЖА 7 ДНЕЙ", title:"Космические припасы", heroLabel:"СКИДКА ДО", heroSub:"Обсидиан и монеты по специальной цене.", featured:"ВЫГОДНАЯ ПОКУПКА", more:"ЕЩЁ СКИДКИ", off:"СКИДКА", bannerHeadline:"Скидки на космические припасы", detail:"Обсидиан и монеты: скидки до 70%.", close:"Закрыть", view:"Все предложения", later:"Позже", buy:"К товарам", discount:v=>`−${v}%`, badge:v=>`АКЦИЯ −${v}%` },
  es: { kicker:"OFERTA DE 7 DÍAS", title:"Suministros cósmicos", heroLabel:"AHORRA HASTA", heroSub:"Obsidiana y monedas a precio especial.", featured:"OFERTA ESTRELLA", more:"MÁS DESCUENTOS", off:"DTO.", bannerHeadline:"Rebajas de suministros cósmicos", detail:"Obsidiana y monedas con hasta 70% de descuento.", close:"Cerrar", view:"Ver todas las ofertas", later:"Ver más tarde", buy:"Ver productos", discount:v=>`−${v}%`, badge:v=>`OFERTA −${v}%` }
});
window.getSalePromotionText = () => SALE_PROMOTION_I18N[currentLanguage] || SALE_PROMOTION_I18N.en;

const salePreviewMode = SHOP_SALE_PREVIEW;
const saleLiveMode = !salePreviewMode && IS_ANDROID_APP;
if (salePreviewMode || saleLiveMode) {
  const dialog = document.createElement("dialog");
  dialog.id = "salePromotionDialog";
  dialog.className = "sale-dialog";
  dialog.setAttribute("aria-labelledby", "salePromotionTitle");
  document.body.appendChild(dialog);
  let shownThisLaunch = false;
  let waitingForStarterClose = false;
  const productById = id => shopProducts.find(product => product.id === id) || OBSIDIAN_PRODUCTS.find(product => product.id === id);
  const activeSaleIds = () => salePreviewMode
    ? Object.keys(SHOP_SALE_PREVIEW_DISCOUNTS)
    : (window.spaceTowerSaleCatalog?.activeProductIds || []);
  const currentDeals = () => activeSaleIds()
    .map(id => ({ product: productById(id), discount: SHOP_SALE_PREVIEW_DISCOUNTS[id] }))
    .filter(deal => deal.product && deal.discount)
    .sort((a, b) => a.discount - b.discount);
  const previewPrice = (product, discount) => {
    const originalCents = Math.round(Number(String(product.priceUsd).replace(/[^\d.]/g, "")) * 100);
    if (!originalCents) return "";
    return `$${(Math.round(originalCents * (1 - discount / 100)) / 100).toFixed(2)}`;
  };
  function renderSalePromotion() {
    const t = window.getSalePromotionText();
    const deals = currentDeals();
    const heroDeal = [...deals].sort((a, b) => b.discount - a.discount)[0];
    if (!heroDeal) return false;
    const tierDeals = [10, 30, 50, 70]
      .map(discount => deals.find(deal => deal.discount === discount))
      .filter(Boolean);
    const tiers = tierDeals.map(({ product, discount }) => {
      const symbol = product.currencyType === "spaceCoin" ? "✦" : "◆";
      return `<div class="sale-tier"><span>${symbol} ${Number(product.amount).toLocaleString("en-US")}</span><b>${escapeHtml(t.discount(discount))}</b></div>`;
    }).join("");
    const product = heroDeal.product;
    const originalPrice = String(product.priceUsd || "");
    const discountedPrice = previewPrice(product, heroDeal.discount);
    dialog.innerHTML = `<div class="sale-dialog-hero"><div class="sale-dialog-top"><span class="sale-dialog-kicker">✦ ${escapeHtml(t.kicker)}</span><button type="button" class="sale-dialog-close" data-sale-close aria-label="${escapeHtml(t.close)}">×</button></div><div class="sale-hero-copy"><h2 id="salePromotionTitle">${escapeHtml(t.title)}</h2><div class="sale-big-discount"><span>${escapeHtml(t.heroLabel)}</span><strong>${heroDeal.discount}<small>%</small></strong><b>${escapeHtml(t.off)}</b></div><p>${escapeHtml(t.heroSub)}</p></div></div><div class="sale-dialog-body"><div class="sale-main-deal"><div class="sale-main-kicker">✦ ${escapeHtml(t.featured)} ✦</div><div class="sale-main-product">◆ ${Number(product.amount).toLocaleString("en-US")}</div><div class="sale-main-price"><del>${escapeHtml(originalPrice)}</del><span>→</span><strong>${escapeHtml(discountedPrice)}</strong><em>${escapeHtml(t.discount(heroDeal.discount))}</em></div></div><div class="sale-more-title">${escapeHtml(t.more)}</div><div class="sale-tiers">${tiers}</div><div class="sale-dialog-actions"><button type="button" class="sale-dialog-view" data-sale-view>${escapeHtml(t.view)}</button><button type="button" class="sale-dialog-later" data-sale-close>${escapeHtml(t.later)}</button></div></div>`;
    return true;
  }
  function showSalePromotion() {
    if (shownThisLaunch || dialog.open || !currentDeals().length) return;
    const starterDialog = document.getElementById("starterPackDialog");
    if (starterDialog?.open) {
      if (!waitingForStarterClose) {
        waitingForStarterClose = true;
        starterDialog.addEventListener("close", () => {
          waitingForStarterClose = false;
          window.setTimeout(showSalePromotion, 80);
        }, { once: true });
      }
      return;
    }
    if (!renderSalePromotion()) return;
    shownThisLaunch = true;
    dialog.showModal();
  }
  function handleSaleCatalogReady(event) {
    const catalog = event?.detail || window.spaceTowerSaleCatalog;
    if (!catalog?.loaded || !catalog.activeProductIds?.length) return;
    window.setTimeout(showSalePromotion, 350);
  }
  dialog.addEventListener("click", event => {
    if (event.target.closest("[data-sale-close]")) dialog.close();
    if (event.target.closest("[data-sale-view]")) { dialog.close(); void openShop(); }
  });
  window.addEventListener("space-tower-language-changed", () => { if (dialog.open) renderSalePromotion(); });
  if (salePreviewMode) {
    window.setTimeout(showSalePromotion, 350);
  } else {
    window.addEventListener("space-tower-sale-catalog-ready", handleSaleCatalogReady);
    if (window.spaceTowerSaleCatalog?.loaded) handleSaleCatalogReady({ detail: window.spaceTowerSaleCatalog });
  }
}
