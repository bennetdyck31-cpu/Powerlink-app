// MainActivity.kt
// USB-C Device Detector für Android
// Erkennt angeschlossene USB-C Geräte

package com.powerlink.usbdetector

import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.hardware.usb.UsbDevice
import android.hardware.usb.UsbManager
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.List
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import java.text.SimpleDateFormat
import java.util.*

// MARK: - Datenmodelle
data class USBDeviceInfo(
    val deviceName: String,
    val vendorId: Int,
    val productId: Int,
    val deviceClass: Int,
    val deviceSubclass: Int,
    val deviceId: Int,
    val manufacturerName: String?,
    val productName: String?,
    val serialNumber: String?,
    val version: String?
) {
    val deviceType: String
        get() = when {
            // Apple Geräte (Vendor ID: 0x05AC)
            vendorId == 0x05AC -> {
                when {
                    productName?.contains("iPhone", ignoreCase = true) == true -> "📱 iPhone"
                    productName?.contains("iPad", ignoreCase = true) == true -> "📱 iPad"
                    productName?.contains("Mac", ignoreCase = true) == true -> "💻 MacBook/Mac"
                    else -> "🍎 Apple Device"
                }
            }
            // Samsung (Vendor ID: 0x04E8)
            vendorId == 0x04E8 -> "📱 Samsung Device"
            // Google (Vendor ID: 0x18D1)
            vendorId == 0x18D1 -> "📱 Google Pixel/Android"
            // Andere
            else -> "🔌 USB-C Device"
        }
    
    val vendorIdHex: String get() = "0x${vendorId.toString(16).uppercase()}"
    val productIdHex: String get() = "0x${productId.toString(16).uppercase()}"
}

// MARK: - USB Manager ViewModel
class USBViewModel(private val context: Context) {
    private val usbManager = context.getSystemService(Context.USB_SERVICE) as UsbManager
    private val dateFormat = SimpleDateFormat("HH:mm:ss", Locale.getDefault())
    
    var devices by mutableStateOf<List<USBDeviceInfo>>(emptyList())
        private set
    
    var connectionLog by mutableStateOf<List<String>>(emptyList())
        private set
    
    private val ACTION_USB_PERMISSION = "com.powerlink.usbdetector.USB_PERMISSION"
    
    private val usbReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context, intent: Intent) {
            when (intent.action) {
                UsbManager.ACTION_USB_DEVICE_ATTACHED -> {
                    val device = intent.getParcelableExtra<UsbDevice>(UsbManager.EXTRA_DEVICE)
                    device?.let {
                        addLog("🔌 ANGESCHLOSSEN [${getCurrentTime()}]: ${it.deviceName}")
                        refreshDevices()
                    }
                }
                UsbManager.ACTION_USB_DEVICE_DETACHED -> {
                    val device = intent.getParcelableExtra<UsbDevice>(UsbManager.EXTRA_DEVICE)
                    device?.let {
                        addLog("🔌 ENTFERNT [${getCurrentTime()}]: ${it.deviceName}")
                        refreshDevices()
                    }
                }
                ACTION_USB_PERMISSION -> {
                    synchronized(this) {
                        val device = intent.getParcelableExtra<UsbDevice>(UsbManager.EXTRA_DEVICE)
                        if (intent.getBooleanExtra(UsbManager.EXTRA_PERMISSION_GRANTED, false)) {
                            device?.let {
                                addLog("✅ Berechtigung erteilt: ${it.deviceName}")
                            }
                        } else {
                            addLog("❌ Berechtigung verweigert")
                        }
                        refreshDevices()
                    }
                }
            }
        }
    }
    
    fun register() {
        val filter = IntentFilter().apply {
            addAction(UsbManager.ACTION_USB_DEVICE_ATTACHED)
            addAction(UsbManager.ACTION_USB_DEVICE_DETACHED)
            addAction(ACTION_USB_PERMISSION)
        }
        context.registerReceiver(usbReceiver, filter)
        refreshDevices()
    }
    
    fun unregister() {
        context.unregisterReceiver(usbReceiver)
    }
    
    fun refreshDevices() {
        val deviceList = usbManager.deviceList
        devices = deviceList.values.map { device ->
            // Berechtigung anfragen, falls nicht vorhanden
            if (!usbManager.hasPermission(device)) {
                val permissionIntent = PendingIntent.getBroadcast(
                    context,
                    0,
                    Intent(ACTION_USB_PERMISSION),
                    PendingIntent.FLAG_IMMUTABLE
                )
                usbManager.requestPermission(device, permissionIntent)
            }
            
            USBDeviceInfo(
                deviceName = device.deviceName,
                vendorId = device.vendorId,
                productId = device.productId,
                deviceClass = device.deviceClass,
                deviceSubclass = device.deviceSubclass,
                deviceId = device.deviceId,
                manufacturerName = device.manufacturerName,
                productName = device.productName,
                serialNumber = device.serialNumber,
                version = device.version
            )
        }
    }
    
    private fun addLog(message: String) {
        connectionLog = listOf(message) + connectionLog.take(49)
    }
    
    private fun getCurrentTime(): String = dateFormat.format(Date())
}

// MARK: - Composable UI
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun USBDetectorScreen(viewModel: USBViewModel) {
    var showLog by remember { mutableStateOf(false) }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("PowerLink USB Detector") },
                actions = {
                    IconButton(onClick = { showLog = true }) {
                        Icon(Icons.Default.List, "Log anzeigen")
                    }
                    IconButton(onClick = { viewModel.refreshDevices() }) {
                        Icon(Icons.Default.Refresh, "Aktualisieren")
                    }
                }
            )
        }
    ) { paddingValues ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(paddingValues)
        ) {
            // Status Header
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(16.dp)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp)
                ) {
                    Text(
                        text = "Verbundene Geräte",
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "${viewModel.devices.size} erkannt",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.secondary
                    )
                }
            }
            
            // Device List
            if (viewModel.devices.isEmpty()) {
                EmptyStateView()
            } else {
                LazyColumn(
                    modifier = Modifier.fillMaxSize(),
                    contentPadding = PaddingValues(16.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    items(viewModel.devices) { device ->
                        DeviceCard(device = device)
                    }
                }
            }
        }
    }
    
    // Log Dialog
    if (showLog) {
        LogDialog(
            logs = viewModel.connectionLog,
            onDismiss = { showLog = false }
        )
    }
}

@Composable
fun DeviceCard(device: USBDeviceInfo) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(MaterialTheme.colorScheme.surfaceVariant)
                .padding(16.dp)
        ) {
            // Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = device.deviceType,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.Bold
                )
                Text(
                    text = "ID: ${device.deviceId}",
                    style = MaterialTheme.typography.bodySmall,
                    color = MaterialTheme.colorScheme.secondary
                )
            }
            
            Spacer(modifier = Modifier.height(12.dp))
            
            // Device Info
            InfoRow("Name", device.deviceName)
            device.productName?.let { InfoRow("Produkt", it) }
            device.manufacturerName?.let { InfoRow("Hersteller", it) }
            device.serialNumber?.let { InfoRow("Seriennummer", it) }
            InfoRow("Vendor ID", device.vendorIdHex)
            InfoRow("Product ID", device.productIdHex)
            device.version?.let { InfoRow("Version", it) }
            InfoRow("Klasse", "${device.deviceClass} / ${device.deviceSubclass}")
        }
    }
}

@Composable
fun InfoRow(label: String, value: String) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 2.dp)
    ) {
        Text(
            text = "$label: ",
            style = MaterialTheme.typography.bodySmall,
            fontWeight = FontWeight.Medium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Text(
            text = value,
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}

@Composable
fun EmptyStateView() {
    Column(
        modifier = Modifier.fillMaxSize(),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = "🔌",
            style = MaterialTheme.typography.displayLarge
        )
        Spacer(modifier = Modifier.height(16.dp))
        Text(
            text = "Keine USB-C Geräte verbunden",
            style = MaterialTheme.typography.titleMedium,
            fontWeight = FontWeight.Bold
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = "Schließe ein Gerät über USB-C an",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.secondary
        )
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun LogDialog(logs: List<String>, onDismiss: () -> Unit) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Verbindungsprotokoll") },
        text = {
            LazyColumn {
                items(logs) { log ->
                    Text(
                        text = log,
                        style = MaterialTheme.typography.bodySmall,
                        modifier = Modifier.padding(vertical = 4.dp)
                    )
                }
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text("Schließen")
            }
        }
    )
}

// MARK: - MainActivity
class MainActivity : ComponentActivity() {
    private lateinit var viewModel: USBViewModel
    
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        viewModel = USBViewModel(this)
        
        setContent {
            MaterialTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    USBDetectorScreen(viewModel = viewModel)
                }
            }
        }
    }
    
    override fun onResume() {
        super.onResume()
        viewModel.register()
    }
    
    override fun onPause() {
        super.onPause()
        viewModel.unregister()
    }
}
