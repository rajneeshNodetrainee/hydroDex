package models

import (
	"github.com/HydroProtocol/hydro-sdk-backend/utils"
	"github.com/stretchr/testify/assert"
	"os"
	"testing"
)

func Test_PG_GetDefaultMarketDao(t *testing.T) {
	setEnvs()
	InitTestDBPG()

	markets := MarketDaoPG.FindAllMarkets()
	assert.EqualValues(t, 0, len(markets))
}

func Test_PG_MarketDao_FindAndInsertMarket(t *testing.T) {
	setEnvs()
	InitTestDBPG()

	dbMarket := MarketDaoPG.FindMarketByID("HOT-WETH")
	assert.Nil(t, dbMarket)

	market := Market{
		ID:                 "HOT-WETH",
		BaseTokenSymbol:    "HOT",
		BaseTokenName:      "HOT",
		QuoteTokenSymbol:   "WETH",
		QuoteTokenName:     "WETH",
		BaseTokenAddress:   os.Getenv("HSK_HYDRO_TOKEN_ADDRESS"),
		QuoteTokenAddress:  os.Getenv("HSK_WETH_TOKEN_ADDRESS"),
		BaseTokenDecimals:  18,
		QuoteTokenDecimals: 18,
		MinOrderSize:       utils.IntToDecimal(1),
		PricePrecision:     8,
		PriceDecimals:      8,
		AmountDecimals:     8,
		MakerFeeRate:       utils.StringToDecimal("0.001"),
		TakerFeeRate:       utils.StringToDecimal("0.001"),
		GasUsedEstimation:  250000,
		IsPublished:        true,
	}

	assert.Nil(t, MarketDaoPG.InsertMarket(&market))
	dbMarket = MarketDaoPG.FindMarketByID("HOT-WETH")

	publishMarkets := MarketDaoPG.FindPublishedMarkets()
	assert.EqualValues(t, 1, len(publishMarkets))

	assert.EqualValues(t, market.ID, dbMarket.ID)
	assert.EqualValues(t, market.BaseTokenDecimals, dbMarket.BaseTokenDecimals)
	assert.EqualValues(t, market.BaseTokenSymbol, dbMarket.BaseTokenSymbol)
	assert.EqualValues(t, market.BaseTokenName, dbMarket.BaseTokenName)
}


/*
This code contains test cases for the "MarketDaoPG" struct and its associated methods.

The first test case, "Test_PG_GetDefaultMarketDao," initializes the test environment, initializes the PostgreSQL test database, and then calls the "FindAllMarkets" method of the "MarketDaoPG" struct. It asserts that the length of the returned markets is 0, indicating that no markets are present in the database.

The second test case, "Test_PG_MarketDao_FindAndInsertMarket," also initializes the test environment and the PostgreSQL test database. It first calls the "FindMarketByID" method of the "MarketDaoPG" struct with a specific market ID ("HOT-WETH") and asserts that the returned market is nil, indicating that the market doesn't exist in the database yet.

Next, a new market instance is created with the necessary fields populated, such as ID, token symbols, addresses, decimals, fee rates, and other properties. The "InsertMarket" method of the "MarketDaoPG" struct is then called to insert the market into the database. The test asserts that the return value of the insertion is nil, indicating that the insertion was successful.

After inserting the market, the "FindMarketByID" method is called again with the same market ID to retrieve the inserted market from the database. The test asserts that the retrieved market matches the inserted market in terms of its ID, token decimals, symbols, and names.

Finally, the "FindPublishedMarkets" method of the "MarketDaoPG" struct is called to retrieve all published markets from the database. The test asserts that the length of the returned markets is 1, indicating that one market is published.

Overall, these test cases verify the functionality of the "MarketDaoPG" struct's methods for finding and inserting markets in a PostgreSQL database.
*/