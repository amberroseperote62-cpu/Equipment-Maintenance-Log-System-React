<?php
use App\Http\Controllers\{AuthController, DashboardController, EquipmentController, LogController, RepairRequestController, RoomController, UserController};
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/forgot-password', [AuthController::class, 'forgot']);
Route::post('/reset-password', [AuthController::class, 'reset']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/dashboard', DashboardController::class);

    Route::get('/rooms', [RoomController::class, 'index']);
    Route::get('/equipment', [EquipmentController::class, 'index']);
    Route::get('/equipment/{id}', [EquipmentController::class, 'show']);
    Route::get('/logs', [LogController::class, 'index']);
    Route::get('/repair-requests', [RepairRequestController::class, 'index']);

    Route::middleware('role:admin,incharge')->post('/repair-requests', [RepairRequestController::class, 'store']);
    Route::middleware('role:admin,technician')->post('/logs', [LogController::class, 'store']);

    Route::middleware('role:admin')->group(function () {
        Route::apiResource('users', UserController::class)->except('show');
        Route::apiResource('rooms', RoomController::class)->except(['index', 'show']);
        Route::apiResource('equipment', EquipmentController::class)->only(['store', 'update', 'destroy']);
        Route::patch('/repair-requests/{repairRequest}/assign', [RepairRequestController::class, 'assign']);
        Route::patch('/repair-requests/{repairRequest}/resolve', [RepairRequestController::class, 'resolve']);
        Route::patch('/logs/{log}/void', [LogController::class, 'void']);
    });
});
