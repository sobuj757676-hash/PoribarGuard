import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

// Update a subscription package
export async function PUT(request, { params }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    const { name, description, priceMonthly, priceYearly, features, isActive, isPopular, btnText } = body;

    if (features) {
      try {
        JSON.parse(features);
      } catch (e) {
        return NextResponse.json(
          { error: "Invalid features format (must be valid JSON string)" },
          { status: 400 }
        );
      }
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (priceMonthly !== undefined) updateData.priceMonthly = parseFloat(priceMonthly);
    if (priceYearly !== undefined) updateData.priceYearly = priceYearly ? parseFloat(priceYearly) : null;
    if (features !== undefined) updateData.features = features;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (isPopular !== undefined) updateData.isPopular = isPopular;
    if (btnText !== undefined) updateData.btnText = btnText;

    const updatedPackage = await prisma.subscriptionPackage.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedPackage);
  } catch (error) {
    console.error("Error updating package:", error);
    return NextResponse.json(
      { error: "Failed to update package" },
      { status: 500 }
    );
  }
}

// Delete a subscription package
export async function DELETE(request, { params }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = params;

    await prisma.subscriptionPackage.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting package:", error);
    return NextResponse.json(
      { error: "Failed to delete package" },
      { status: 500 }
    );
  }
}
