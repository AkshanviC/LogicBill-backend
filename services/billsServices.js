import Bills from "../models/bills.js";
import Invoices from "..//models/invoices.js";
import sequelize from "../utils/db.js";

/**
 * Creates a new bill and assigns selected invoices to it
 * @param {Array<number>} invoiceIds - Array of Invoice IDs to bundle
 * @param {number} userId - ID of the user creating the bill
 */
export const createBill = async (invoiceIds, userId) => {
  // Use a transaction so if linking invoices fails, the bill isn't created
  const transaction = await sequelize.transaction();

  try {
    // 1. Fetch invoices to calculate total amount
    const invoices = await Invoices.findAll({
      where: { id: invoiceIds },
      transaction,
    });

    if (invoices.length === 0) {
      throw new Error("No valid invoices found to generate a bill.");
    }

    // 2. Sum up totals (Assumes invoice has an 'amount' or similar field, adjust accordingly)
    const totalAmount = invoices.reduce(
      (sum, inv) => sum + parseFloat(inv.amount || 0),
      0,
    );

    // 3. Create the Bill record
    const newBill = await Bills.create(
      {
        totalAmount,
        createdBy: userId,
      },
      { transaction },
    );

    // 4. Update the invoices to link them to this new Bill ID
    await Invoices.update(
      { billId: newBill.id },
      {
        where: { id: invoiceIds },
        transaction,
      },
    );

    await transaction.commit();
    return newBill; // newBill.id is your sequential bill number (e.g., 1001)
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

/**
 * Retrieves a single bill by its ID along with its linked invoices
 * @param {number} billId - The ID/BillNo of the bill
 */
export const getBillById = async (billId) => {
  try {
    const bill = await Bills.findByPk(billId, {
      include: [
        {
          model: Invoices,
          // attributes: ['id', 'amount', 'date'] // Optional: limit fields returned
        },
      ],
    });

    if (!bill) {
      throw new Error("Bill not found");
    }

    return bill;
  } catch (error) {
    throw error;
  }
};

/**
 * Updates basic bill information
 * @param {number} billId - The ID of the bill to update
 * @param {Object} updateData - Object containing fields to update (e.g., { totalAmount: 5000 })
 */
export const updateBill = async (billId, updateData) => {
  try {
    const [updatedRows] = await Bills.update(updateData, {
      where: { id: billId },
    });

    if (updatedRows === 0) {
      throw new Error("Bill not found or no changes made");
    }

    return { message: "Bill updated successfully" };
  } catch (error) {
    throw error;
  }
};

/**
 * Deletes a bill and unlinks its associated invoices
 * @param {number} billId - The ID of the bill to delete
 */
export const deleteBill = async (billId) => {
  const transaction = await sequelize.transaction();

  try {
    // 1. Unlink invoices from this bill (sets billId back to NULL)
    await Invoices.update(
      { billId: null },
      {
        where: { billId: billId },
        transaction,
      },
    );

    // 2. Delete the Bill row
    const deletedRows = await Bills.destroy({
      where: { id: billId },
      transaction,
    });

    if (deletedRows === 0) {
      throw new Error("Bill not found");
    }

    await transaction.commit();
    return {
      message: "Bill deleted and associated invoices unlinked successfully",
    };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};
