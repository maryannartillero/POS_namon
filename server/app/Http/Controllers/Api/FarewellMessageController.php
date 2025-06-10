<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FarewellMessage;
use Illuminate\Http\Request;

class FarewellMessageController extends Controller
{
    public function index()
    {
        $messages = FarewellMessage::orderBy('display_order')->get();
        return response()->json(['messages' => $messages]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'message' => 'required|string|max:500',
            'display_order' => 'nullable|integer|min:0',
        ]);

        $message = FarewellMessage::create([
            'message' => $request->message,
            'display_order' => $request->display_order ?? FarewellMessage::max('display_order') + 1,
        ]);

        return response()->json([
            'message' => 'Farewell message created successfully',
            'farewell_message' => $message
        ], 201);
    }

    public function update(Request $request, FarewellMessage $farewellMessage)
    {
        $request->validate([
            'message' => 'required|string|max:500',
            'is_active' => 'boolean',
            'display_order' => 'nullable|integer|min:0',
        ]);

        $farewellMessage->update($request->all());

        return response()->json([
            'message' => 'Farewell message updated successfully',
            'farewell_message' => $farewellMessage
        ]);
    }

    public function destroy(FarewellMessage $farewellMessage)
    {
        $farewellMessage->delete();

        return response()->json([
            'message' => 'Farewell message deleted successfully'
        ]);
    }

    public function getRandom()
    {
        $message = FarewellMessage::getRandomActiveMessage();
        
        return response()->json([
            'message' => $message
        ]);
    }
}