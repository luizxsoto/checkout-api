# Checkout API

- [ ] Validar se as injeções dos testes estão sendo chamadas corretamente
- [ ] Testar a Presentation Layer
- [ ] A cada request feita, deve ser criado novas instancias das classes, pois ao deixar como singleton, pode ocasionar de conflitar retornos entre requests. Exemplo: Alterar um customer com e-mail que sim existe, e depois alterar denovo com esse mesmo e-mail. Na primeira alteração o validatorData vai ser um array vazio, mas na segunda virá o registro encontrado da request anterior. Portanto, validar quais classes podem continuar como singleton e quais serão scoped
- [ ] Repositories de Update e Delete devem retornar pelo menos as propriedades que foram criadas lá dentro
