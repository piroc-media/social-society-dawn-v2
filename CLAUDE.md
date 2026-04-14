# Shopify Theme Development Notes

## Liquid Escaping Rules

**Never add `| escape` to settings with type `richtext` or `inline_richtext`.** These setting types are designed to output HTML (bold, italic, links). Escaping them turns rendered markup into visible `<a href=...>` plain text. Shopify already restricts the HTML these fields accept, so there is no XSS risk.

`| escape` is correct for:
- Plain text settings (`type: "text"`)
- Built-in Liquid objects (`product.title`, `article.title`, `page_description`)
- Image alt text, option names, meta tag content

Before adding `| escape` to any Liquid output, check the setting's `type` in the `{% schema %}` block. If it is `richtext` or `inline_richtext`, do not escape it.
