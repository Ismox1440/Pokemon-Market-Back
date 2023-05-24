# Pokemon Market - Backend

This is a backend built with Express and Mongoose for a REST API. It provides various routes and controllers to manage items, pokeballs, pokemons, users, and weekly gifts.

## API REST Routes

### Items

- `POST /items/create`: Creates an item that requires the following fields in the request body: `{ name, description, image, price, category }`. Returns the created item.

- `GET /items/shop`: Retrieves all items that contain the "price" field in their model. Requires authentication using a JWT token.

### Pokeballs

- `POST /pokeballs/create`: Creates a pokeball that requires the following fields in the request body: `{ name, image, catchRate, description, price }`. Returns the created pokeball.

### Pokemon

- `GET /pokemon/`: Retrieves pokemons based on filters, sorting, limits, and sorts passed as query parameters.

- `GET /pokemon/id/:id`: Returns a pokemon based on its id. Requires authentication using a JWT token.

- `PUT /pokemon/:id/claim-lovepotion`: Claims the love potions of the pokemons. Once claimed, the love potions are transferred to the user, and the pokemon's love potion count is reset to 0. It cannot be claimed again until one hour has passed. Requires authentication using a JWT token.

- `GET /pokemon/lastedpokemonsforsale`: Returns the last 10 pokemons listed for sale. Requires authentication using a JWT token.

### User

- `GET /user/getuser/:email`: Searches for a user by email. If not found, creates and returns the user. Requires authentication using a JWT token.

- `PUT /user/usepokeball`: Uses a pokeball provided by the user in the request body: `{ user_id, pokeball_id }`. Returns a pokemon based on the pokeball specifications. Requires authentication using a JWT token.

- `GET /user/pokemons/:ownerEmail`: Returns the pokemons owned by the user. Requires authentication using a JWT token.

- `PUT /user/sellpokemon`: Sells a pokemon owned by the user based on the parameters passed in the request body: `{ user_id, pokemon_id, price, typeSale }`. Requires authentication using a JWT token.

- `PUT /user/buypokemon`: Buys a pokemon. Requires the following fields in the request body: `{ pokemon_id, user_id }`. Requires authentication using a JWT token.

- `PUT /user/buyitem`: Buys an item. Requires the following fields in the request body: `{ user_id, item_id, itemType, count }`. Requires authentication using a JWT token.

- `PUT /user/useitem`: Uses an item owned by the user and subtracts it from the total count. Requires the following fields in the request body: `{ user_id, pokemon_id, item_id, count }`. Requires authentication using a JWT token.

- `PUT /user/claimdailygift`: Claims the user's daily reward. After claiming, the user cannot claim again until the next day. Requires authentication using a JWT token.

- `GET /user/id/:id`: Returns a user based on their id. Requires authentication using a JWT token.

- `PATCH /user/update`: Updates a user based on the fields provided in the request body. Requires authentication using a JWT token.

- `GET /user/top`: Returns the top 10 users with the most coins or stats. Requires authentication using a JWT token.

### Week Gifts

- `POST /weekgifts/create`: Creates a week of gifts. Requires authentication using a JWT token.

- `GET /weekgifts/current`: Returns the current week of gifts. Requires authentication using a JWT token.
