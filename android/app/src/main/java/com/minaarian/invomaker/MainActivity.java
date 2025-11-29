package com.minaarian.invomaker;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.revenuecat.purchases.Purchases;
import com.revenuecat.purchases.PurchasesConfiguration;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Initialize RevenueCat
        // Get API key from strings.xml or BuildConfig
        String revenueCatApiKey = getString(getResources().getIdentifier("revenuecat_api_key", "string", getPackageName()));
        if (revenueCatApiKey != null && !revenueCatApiKey.isEmpty()) {
            PurchasesConfiguration configuration = new PurchasesConfiguration.Builder(this, revenueCatApiKey).build();
            Purchases.configure(configuration);
            android.util.Log.d("MainActivity", "RevenueCat initialized with API key");
        } else {
            android.util.Log.w("MainActivity", "Warning: RevenueCat API key not found. Please add revenuecat_api_key to strings.xml");
        }
    }
}

