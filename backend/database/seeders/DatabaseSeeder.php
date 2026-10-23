<?php
namespace Database\Seeders;
use App\Models\{Equipment, Room, User};
use Illuminate\Database\Seeder;
class DatabaseSeeder extends Seeder {
    public function run(): void {
        User::create(['name' => 'Admin Custodian', 'email' => 'admin@example.com', 'password' => 'password', 'role' => 'admin']);
        User::create(['name' => 'Tom Technician', 'email' => 'tech@example.com', 'password' => 'password', 'role' => 'technician']);
        $ic = User::create(['name' => 'Faye Faculty', 'email' => 'faculty@example.com', 'password' => 'password', 'role' => 'incharge']);
        $room = Room::create(['room_name' => 'Room 101', 'building' => 'Main Building', 'floor' => '1', 'in_charge_id' => $ic->id]);
        foreach ([['Projector', 'PN-0001', 'Projector'], ['Desktop PC', 'PN-0002', 'Computer'], ['Air Conditioner', 'PN-0003', 'Appliance']] as [$n, $p, $c])
            Equipment::create(['room_id' => $room->id, 'name' => $n, 'property_number' => $p, 'category' => $c]);
    }
}
