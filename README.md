# Checkout API

- [ ] Validar se as injeções dos testes estão sendo chamadas corretamente
- [ ] Não é mais necessário mocar o `then` do knex, pois atualmente o valor retornado do repositorio, não é mais o que o knex retorna
- [ ] Remover teste desnecessário do CustomerRepository que valida se é lançado um `DatabaseException`, pois é necessário validar apenas no BaseRepository
