plugins {
    id("com.android.application")
}

android {
    namespace = "tech.revolvo.meathead.staff"
    compileSdk = 35

    defaultConfig {
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "1.0.0"
    }

    buildFeatures {
        buildConfig = true
    }

    flavorDimensions += "role"
    productFlavors {
        create("rider") {
            dimension = "role"
            applicationId = "tech.revolvo.meathead.rider"
            resValue("string", "app_name", "Meathead Rider")
            buildConfigField("String", "START_URL", "\"https://meatheadpakistan.vercel.app/rider\"")
            buildConfigField("boolean", "LOCATION_ENABLED", "true")
        }
        create("chef") {
            dimension = "role"
            applicationId = "tech.revolvo.meathead.chef"
            resValue("string", "app_name", "Meathead Chef")
            buildConfigField("String", "START_URL", "\"https://meatheadpakistan.vercel.app/chef\"")
            buildConfigField("boolean", "LOCATION_ENABLED", "false")
        }
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro",
            )
            // Internal sideload builds are signed with this machine's Android
            // debug certificate. Use a private release keystore before a store launch.
            signingConfig = signingConfigs.getByName("debug")
        }
    }

    applicationVariants.all {
        outputs.all {
            val output = this as com.android.build.gradle.internal.api.BaseVariantOutputImpl
            output.outputFileName = "meathead-${flavorName}-${buildType.name}-v${versionName}.apk"
        }
    }
}
