'use strict';

// Deterministic JSON.stringify()
const stringify  = require('json-stringify-deterministic');
const sortKeysRecursive  = require('sort-keys-recursive');
const { Contract } = require('fabric-contract-api');

class AssetCrowd extends Contract {

    async InitLedger(ctx) {
        const assets = [
            {
                PassportID: '1534543643',
                Name: 'Petr',
                Surname: 'Baklazhanov',
                City: 'Saint-Petersburg',
                LivingAddress: 'Stalina 28',
                Phone: '+71234567890',
                Family: 'Alone',
            },
            {
                PassportID: '1534536643',
                Name: 'Vasiliy',
                Surname: 'Morkov',
                City: 'Ufa',
                LivingAddress: 'Lenina 35',
                Phone: '+71234567891',
                Family: 'Married',
            },
            {
                PassportID: '1534543631',
                Name: 'Ilya',
                Surname: 'Kapusta',
                City: 'Moscow',
                LivingAddress: 'Zhukova 14',
                Phone: '+71234567892',
                Family: 'Unmarried',
            },
            {
                PassportID: '1204643643',
                Name: 'Dmitriy',
                Surname: 'Budeniy',
                City: 'Lipetsk',
                LivingAddress: 'Karbysheva 11',
                Phone: '+71234567893',
                Family: 'Ringed',
            },
            {
                PassportID: '1534543643',
                Name: 'Nikita',
                Surname: 'Semenov',
                City: 'Tver',
                LivingAddress: 'Voroshilova 1',
                Phone: '+71234567894',
                Family: 'Married',
            },
        ];

        for (const asset of assets) {
            asset.docType = 'asset';
            // example of how to write to world state deterministically
            // use convetion of alphabetic order
            // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
            // when retrieving data, in any lang, the order of data will be the same and consequently also the corresonding hash
            await ctx.stub.putState(asset.PassportID, Buffer.from(stringify(sortKeysRecursive(asset))));
        }
    }

    // CreateAsset issues a new asset to the world state with given details.
    async CreateAsset(ctx, passportId, name, surname, city, livingAddress, phone, family) {
        const exists = await this.AssetExists(ctx, passportId);
        if (exists) {
            throw new Error(`The asset ${passportId} already exists`);
        }

        const asset = {
            PassportID: passportId,
            Name: name,
            Surname: surname,
            City: city,
            LivingAddress: livingAddress,
            Phone: phone,
            Family: family,
        };
        //we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        await ctx.stub.putState(passportId, Buffer.from(stringify(sortKeysRecursive(asset))));
        return JSON.stringify(asset);
    }

    // ReadAsset returns the asset stored in the world state with given id.
    async ReadAsset(ctx, passportId) {
        const assetJSON = await ctx.stub.getState(passportId); // get the asset from chaincode state
        if (!assetJSON || assetJSON.length === 0) {
            throw new Error(`The asset ${passportId} does not exist`);
        }
        return assetJSON.toString();
    }

    // UpdateAsset updates an existing asset in the world state with provided parameters.
    async UpdateAsset(ctx, passportId, name, surname, city, livingAddress, phone, family) {
        const exists = await this.AssetExists(ctx, passportId);
        if (!exists) {
            throw new Error(`The asset ${passportId} does not exist`);
        }

        // overwriting original asset with new asset
        const updatedAsset = {
            PassportID: passportId,
            Name: name,
            Surname: surname,
            City: city,
            LivingAddress: livingAddress,
            Phone: phone,
            Family: family,
        };
        // we insert data in alphabetic order using 'json-stringify-deterministic' and 'sort-keys-recursive'
        return ctx.stub.putState(passportId, Buffer.from(stringify(sortKeysRecursive(updatedAsset))));
    }

    // DeleteAsset deletes an given asset from the world state.
    async DeleteAsset(ctx, passportId) {
        const exists = await this.AssetExists(ctx, passportId);
        if (!exists) {
            throw new Error(`The asset ${passportId} does not exist`);
        }
        return ctx.stub.deleteState(passportId);
    }

    // AssetExists returns true when asset with given ID exists in world state.
    async AssetExists(ctx, passportId) {
        const assetJSON = await ctx.stub.getState(passportId);
        return assetJSON && assetJSON.length > 0;
    }

    async ReadAssetChanges(ctx, passportId) {
      const history = await ctx.stub.getHistoryForKey(passportId);
      let allResults = [];
      if (!history || history.length == 0) {
          throw new Error(`No data for ${passportId} asset`);
      }

      while (true) {
        let res = await history.next();
        if (res.value && res.value.value.toString()) {
          let jsonRes = {};
          jsonRes.PassportID = res.value.passport_id;
          jsonRes.Value = JSON.parse(res.value.value.toString('utf8'));
          allResults.push(jsonRes);
        }
        if (res.done) {
          console.log('end of data');
          await history.close();
          console.info(allResults);
          return allResults;
        }
      }

      return allResults;
    }

    // GetAllAssets returns all assets found in the world state.
    async GetAllCrowd(ctx) {
        const allResults = [];
        // range query with empty string for startKey and endKey does an open-ended query of all assets in the chaincode namespace.
        const iterator = await ctx.stub.getStateByRange('', '');
        let result = await iterator.next();
        while (!result.done) {
            const strValue = Buffer.from(result.value.value.toString()).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push(record);
            result = await iterator.next();
        }
        return JSON.stringify(allResults);
    }
}

module.exports = AssetCrowd;
