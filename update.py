import re

with open('c:/Users/medoz/OneDrive/Desktop/asaw/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# 1. Add " / سكوب" to classic, fruits, chocolate, and premium sections
def add_scoop_label(match):
    section = match.group(0)
    # Replace the closing span for prices in this section to include the scoop text
    section = section.replace('</span></div><div class="add-to-cart-wrapper">', ' <small style="font-size:0.7rem;font-weight:400;color:var(--text-muted);">/ سكوب</small></span></div><div class="add-to-cart-wrapper">')
    return section

pattern = re.compile(r'<!-- Category: (?:Classic Flavors|Fruits Collection|Chocolate Collection|Premium Flavors) -->.*?</div>\s*</div>', re.DOTALL)
html = pattern.sub(add_scoop_label, html)

# 2. Inject new sections
new_sections = """
                <!-- Category: Desserts -->
                <div class="menu-category-section hidden" id="desserts">
                    <div class="items-grid">
                        <div class="menu-item card"><div class="item-header"><h4 class="item-title">بسبوسة مكس - 1 كيلو <span class="en">Mixed Basbousa</span></h4><span class="item-price">10,000</span></div><div class="add-to-cart-wrapper"><button class="add-to-cart-btn"><i class="fa-solid fa-cart-plus"></i> إضافة</button></div></div>
                        <div class="menu-item card"><div class="item-header"><h4 class="item-title">بسبوسة - 1 كيلو <span class="en">Basbousa</span></h4><span class="item-price">12,000</span></div><div class="add-to-cart-wrapper"><button class="add-to-cart-btn"><i class="fa-solid fa-cart-plus"></i> إضافة</button></div></div>
                    </div>
                </div>

                <!-- Category: Juices -->
                <div class="menu-category-section hidden" id="juices">
                    <div class="items-grid">
                        <div class="menu-item card"><div class="item-header"><h4 class="item-title">فراولة <span class="en">Strawberry</span></h4><span class="item-price">5,000</span></div><div class="add-to-cart-wrapper"><button class="add-to-cart-btn"><i class="fa-solid fa-cart-plus"></i> إضافة</button></div></div>
                        <div class="menu-item card"><div class="item-header"><h4 class="item-title">مانجو <span class="en">Mango</span></h4><span class="item-price">5,000</span></div><div class="add-to-cart-wrapper"><button class="add-to-cart-btn"><i class="fa-solid fa-cart-plus"></i> إضافة</button></div></div>
                    </div>
                </div>

                <!-- Category: Family Packs -->
                <div class="menu-category-section hidden" id="family">
                    <div class="items-grid">
                        <div class="menu-item card"><div class="item-header"><h4 class="item-title">فانيليا + شوكولاتة <span class="en">Vanilla + Chocolate</span></h4><span class="item-price">22,000</span></div><div class="add-to-cart-wrapper"><button class="add-to-cart-btn"><i class="fa-solid fa-cart-plus"></i> إضافة</button></div></div>
                        <div class="menu-item card"><div class="item-header"><h4 class="item-title">فانيليا + فراولة <span class="en">Vanilla + Strawberry</span></h4><span class="item-price">22,000</span></div><div class="add-to-cart-wrapper"><button class="add-to-cart-btn"><i class="fa-solid fa-cart-plus"></i> إضافة</button></div></div>
                        <div class="menu-item card"><div class="item-header"><h4 class="item-title">شوكولاتة + أوريو <span class="en">Chocolate + Oreo</span></h4><span class="item-price">25,000</span></div><div class="add-to-cart-wrapper"><button class="add-to-cart-btn"><i class="fa-solid fa-cart-plus"></i> إضافة</button></div></div>
                    </div>
                </div>
"""

# Insert new sections right before the Toppings section
insertion_point = '<!-- Category: Toppings & Sauces -->'
html = html.replace(insertion_point, new_sections + '\n                ' + insertion_point)

with open('c:/Users/medoz/OneDrive/Desktop/asaw/index.html', 'w', encoding='utf-8') as f:
    f.write(html)
