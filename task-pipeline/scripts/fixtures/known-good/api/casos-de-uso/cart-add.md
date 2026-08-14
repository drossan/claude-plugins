# CU-cart-add — añadir producto
## Criterios de aceptación (Gherkin)
```gherkin
Feature: añadir
  Scenario: añade un producto
    Given un carrito vacío
    When añado "A-1"
    Then el carrito tiene 1 producto
```
